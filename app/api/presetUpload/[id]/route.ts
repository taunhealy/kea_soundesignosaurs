import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Get preset details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preset = await prisma.presetUpload.findUnique({
      where: {
        id: params.id,
      },
      include: {
        soundDesigner: {
          select: {
            username: true,
            profileImage: true,
          },
        },
        genre: true,
        vst: true,
      },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Verify ownership
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    if (preset.soundDesignerId !== soundDesigner?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Error fetching preset:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update preset
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    const existingPreset = await prisma.presetUpload.findUnique({
      where: { id: params.id },
    });

    if (
      !existingPreset ||
      existingPreset.soundDesignerId !== soundDesigner?.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const updatedPreset = await prisma.presetUpload.update({
      where: {
        id: params.id,
      },
      data: {
        title: body.title,
        description: body.description,
        guide: body.guide,
        spotifyLink: body.spotifyLink,
        genreId: body.genreId,
        vstId: body.vstId,
        presetType: body.presetType,
        soundPreviewUrl: body.soundPreviewUrl,
        presetFileUrl: body.presetFileUrl,
        originalFileName: body.originalFileName,
        price: body.price || 0,
        stripeProductId: body.stripeProductId,
      },
      include: {
        soundDesigner: {
          select: {
            username: true,
            profileImage: true,
          },
        },
        genre: true,
        vst: true,
      },
    });

    return NextResponse.json(updatedPreset);
  } catch (error) {
    console.error("Error updating preset:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the soundDesigner
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId: clerkUserId },
      select: { id: true },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound Designer not found" },
        { status: 403 }
      );
    }

    // Get the preset
    const preset = await prisma.presetUpload.findUnique({
      where: { id: params.id },
      select: { soundDesignerId: true },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    if (preset.soundDesignerId !== soundDesigner.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Use a transaction to delete related records first
    await prisma.$transaction(async (tx) => {
      // First delete all related downloads
      await tx.presetDownload.deleteMany({
        where: { presetId: params.id },
      });

      // Then delete the preset itself
      await tx.presetUpload.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting preset:", error);
    return NextResponse.json(
      {
        error: "Failed to delete preset",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
