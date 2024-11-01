import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer profile not found" },
        { status: 404 }
      );
    }

    const packs = await prisma.presetPack.findMany({
      where: {
        soundDesignerId: soundDesigner.id,
      },
      include: {
        presets: {
          include: {
            preset: true,
          },
        },
        soundDesigner: {
          select: {
            username: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(packs);
  } catch (error) {
    console.error("Error fetching preset packs:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset packs" },
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

    // Get the sound designer first
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer profile not found" },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Verify ownership and existence of the preset pack
    const existingPack = await prisma.presetPack.findUnique({
      where: { id: params.id },
    });

    if (!existingPack || existingPack.soundDesignerId !== soundDesigner.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the preset pack
    const updatedPack = await prisma.presetPack.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        presets: {
          deleteMany: {}, // Remove all existing preset connections
          create: data.presetIds.map((presetId: string) => ({
            presetId,
            addedAt: new Date(),
          })),
        },
      },
      include: {
        presets: {
          include: {
            preset: true,
          },
        },
        soundDesigner: {
          select: {
            username: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPack);
  } catch (error) {
    console.error("Error updating preset pack:", error);
    return NextResponse.json(
      { error: "Failed to update preset pack" },
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

    // Get the sound designer first
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer profile not found" },
        { status: 404 }
      );
    }

    const existingPack = await prisma.presetPack.findUnique({
      where: { id: params.id },
    });

    if (!existingPack || existingPack.soundDesignerId !== soundDesigner.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // First delete all related PackPresets records
    await prisma.packPresets.deleteMany({
      where: { packId: params.id },
    });

    // Then delete the preset pack
    await prisma.presetPack.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Preset pack deleted successfully" });
  } catch (error) {
    console.error("Error deleting preset pack:", error);
    return NextResponse.json(
      { error: "Failed to delete preset pack" },
      { status: 500 }
    );
  }
}
