import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const userId = searchParams.get("userId");

  try {
    let requests;
    if (type === "requested") {
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required" },
          { status: 400 }
        );
      }

      requests = await prisma.presetRequest.findMany({
        where: {
          userId: userId,
        },
        include: {
          soundDesigner: {
            select: {
              username: true,
              userId: true,
            },
          },
        },
      });
    } else if (type === "assisted") {
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required" },
          { status: 400 }
        );
      }

      requests = await prisma.presetRequest.findMany({
        where: {
          submissions: {
            some: {
              soundDesigner: {
                userId: userId,
              },
            },
          },
        },
        include: {
          soundDesigner: {
            select: {
              username: true,
              userId: true,
            },
          },
        },
      });
    }

    return NextResponse.json(requests || []);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
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

    // Validate required fields
    if (!data.title || !data.genre || !data.enquiryDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const presetRequest = await prisma.presetRequest.create({
      data: {
        userId,
        title: data.title,
        youtubeLink: data.youtubeLink || null,
        genre: data.genre,
        enquiryDetails: data.enquiryDetails,
        status: "OPEN",
      },
    });

    return NextResponse.json(presetRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
