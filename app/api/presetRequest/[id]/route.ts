import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestThread = await prisma.presetRequest.findUnique({
      where: { id: params.id },
      include: {
        soundDesigner: {
          select: {
            username: true,
          },
        },
        submissions: true,
      },
    });

    if (!requestThread) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(requestThread);
  } catch (error) {
    console.error("Error fetching request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const existingThread = await prisma.presetRequest.findUnique({
      where: { id: params.id },
    });

    if (!existingThread || existingThread.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedThread = await prisma.presetRequest.update({
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

    // Verify ownership before deletion
    const existingRequest = await prisma.presetRequest.findUnique({
      where: { id: params.id },
    });

    if (!existingRequest || existingRequest.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.presetRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
