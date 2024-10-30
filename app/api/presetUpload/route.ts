import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Received data:", data); // Debug log

    // Validate required fields
    if (!data.title || !data.presetType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Create the preset with proper error handling
    try {
      const preset = await prisma.presetUpload.create({
        data: {
          title: data.title,
          description: data.description || "",
          guide: data.guide || "",
          spotifyLink: data.spotifyLink || null,
          soundPreviewUrl: data.soundPreviewUrl || null,
          presetFileUrl: data.presetFileUrl || "",
          presetType: data.presetType,
          tags: data.tags || [],
          soundDesignerId: soundDesigner.id,
          genreId: data.genreId || null,
          vstId: data.vstId || null,
          price: data.price || 0,
        },
      });
      return NextResponse.json(preset);
    } catch (prismaError) {
      console.error("Prisma error:", prismaError);
      return NextResponse.json(
        { error: "Database error creating preset" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let presets;
    if (type === "downloaded") {
      // Get presets downloaded by the user
      presets = await prisma.presetUpload.findMany({
        where: {
          downloads: {
            some: {
              userId: userId,
            },
          },
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
    } else if (type === "uploaded") {
      // Get presets uploaded by the user
      const soundDesigner = await prisma.soundDesigner.findUnique({
        where: { userId: userId },
      });

      if (!soundDesigner) {
        return NextResponse.json(
          { error: "Sound Designer not found" },
          { status: 404 }
        );
      }

      presets = await prisma.presetUpload.findMany({
        where: {
          soundDesignerId: soundDesigner.id,
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
    }

    return NextResponse.json(presets || []);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
