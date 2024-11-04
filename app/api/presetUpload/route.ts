import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { PresetType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const presets = await prisma.presetUpload.findMany({
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

    return NextResponse.json(presets);
  } catch (error) {
    console.error("[DEBUG] Preset upload GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // First, ensure the user has a SoundDesigner profile
    let soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId: userId },
    });

    if (!soundDesigner) {
      soundDesigner = await prisma.soundDesigner.create({
        data: {
          userId: userId,
          username: data.username || "Anonymous",
          name: data.name || "Anonymous",
          email: data.email || `${userId}@placeholder.com`,
        },
      });
    }

    // Validate genre existence if genreId is provided
    if (data.genreId) {
      const genre = await prisma.genre.findUnique({
        where: { id: data.genreId },
      });
      if (!genre) {
        return NextResponse.json(
          { error: "Selected genre does not exist" },
          { status: 400 }
        );
      }
    }

    // Validate VST existence if vstId is provided
    if (data.vstId) {
      const vst = await prisma.vST.findUnique({
        where: { id: data.vstId },
      });
      if (!vst) {
        return NextResponse.json(
          { error: "Selected VST does not exist" },
          { status: 400 }
        );
      }
    }

    // Prepare the create data object
    const createData: any = {
      title: data.title,
      description: data.description,
      guide: data.guide,
      spotifyLink: data.spotifyLink,
      soundPreviewUrl: data.soundPreviewUrl,
      presetFileUrl: data.presetFileUrl,
      originalFileName: data.originalFileName,
      presetType: data.presetType,
      priceType: data.priceType || "FREE",
      price: data.price,
      userId: userId,
      soundDesigner: {
        connect: { id: soundDesigner.id }
      }
    };

    // Only add relations if IDs are provided and valid
    if (data.genreId) {
      createData.genre = { connect: { id: data.genreId } };
    }
    if (data.vstId) {
      createData.vst = { connect: { id: data.vstId } };
    }

    // Create the preset
    const preset = await prisma.presetUpload.create({
      data: createData,
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

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create preset",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
