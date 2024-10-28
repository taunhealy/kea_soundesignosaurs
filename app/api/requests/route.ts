import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const helpThreads = await prisma.helpThread.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(helpThreads);
  } catch (error) {
    console.error("Error fetching help threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch help threads" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Create the help thread
    const helpThread = await prisma.helpThread.create({
      data: {
        title: data.title,
        youtubeLink: data.youtubeLink || null,
        genre: data.genre,
        enquiryDetails: data.enquiryDetails,
        userId: userId,
        status: "OPEN",
      },
    });

    return NextResponse.json(helpThread);
  } catch (error) {
    console.error("Error creating help thread:", error);
    return NextResponse.json(
      { error: "Failed to create help thread" },
      { status: 500 }
    );
  }
}
