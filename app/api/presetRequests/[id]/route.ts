import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestThread = await prisma.presetRequest.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        genre: true,
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Received update data:", data);

    // Verify ownership
    const existingThread = await prisma.presetRequest.findUnique({
      where: { id: params.id },
      include: { genre: true },
    });

    if (!existingThread || existingThread.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedRequest = await prisma.presetRequest.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        youtubeLink: data.youtubeLink,
        genreId: data.genreId,
        enquiryDetails: data.enquiryDetails,
      },
      include: {
        genre: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    console.log("Updated request:", updatedRequest);
    return NextResponse.json(updatedRequest);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const presetRequest = await prisma.presetRequest.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!presetRequest || presetRequest.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.presetRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting preset request:", error);
    return NextResponse.json(
      { error: "Failed to delete preset request" },
      { status: 500 }
    );
  }
}
