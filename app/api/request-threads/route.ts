import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const requestThread = await prisma.helpThread.create({
      data: {
        title: data.title,
        youtubeLink: data.youtubeLink || null,
        genre: data.genre,
        enquiryDetails: data.enquiryDetails,
        userId: userId,
        status: "OPEN",
      },
    });

    return NextResponse.json(requestThread);
  } catch (error) {
    console.error("Error creating request thread:", error);
    return NextResponse.json(
      { error: "Failed to create request thread" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const threads = await prisma.helpThread.findMany({
      where: {
        userId: type === "requested" ? userId : undefined,
        submissions: type === "assisted" ? { some: { userId } } : undefined,
      },
      include: {
        soundDesigner: true, // Include full soundDesigner object
        submissions: {
          include: {
            soundDesigner: true, // Include full soundDesigner object for submissions
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include username
    const transformedThreads = threads.map((thread) => ({
      ...thread,
      username: thread.soundDesigner?.username || "Anonymous",
      submissions: thread.submissions.map((submission) => ({
        ...submission,
        username: submission.soundDesigner?.username || "Anonymous",
      })),
    }));

    return NextResponse.json(transformedThreads);
  } catch (error) {
    console.error("Error fetching help threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch help threads" },
      { status: 500 }
    );
  }
}
