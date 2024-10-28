import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestThread = await prisma.helpThread.findUnique({
      where: {
        id: params.id,
      },
      include: {
        submissions: true,
      },
    });

    if (!requestThread) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify ownership
    if (requestThread.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(requestThread);
  } catch (error) {
    console.error("Error fetching request thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch request thread" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Verify ownership
    const existingThread = await prisma.helpThread.findUnique({
      where: { id: params.id },
    });

    if (!existingThread || existingThread.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedThread = await prisma.helpThread.update({
      where: { id: params.id },
      data: {
        title: data.title,
        youtubeLink: data.youtubeLink || null,
        genre: data.genre,
        enquiryDetails: data.enquiryDetails,
      },
      include: {
        submissions: true,
      },
    });

    return NextResponse.json(updatedThread);
  } catch (error) {
    console.error("Error updating request thread:", error);
    return NextResponse.json(
      { error: "Failed to update request thread" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const thread = await prisma.helpThread.findUnique({
      where: { id: params.id },
    });

    if (!thread || thread.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.helpThread.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting request thread:", error);
    return NextResponse.json(
      { error: "Failed to delete request thread" },
      { status: 500 }
    );
  }
}
