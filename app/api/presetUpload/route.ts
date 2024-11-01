import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const priceSchema = z.object({
  price: z.number().min(5, "Price must be at least $5"),
});

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
    console.log("Received data:", data);

    // Validate required fields and price
    if (!data.title || !data.presetType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate price
    try {
      priceSchema.parse({ price: data.price || 5 });
    } catch (error) {
      return NextResponse.json(
        { error: "Price must be at least $5" },
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
          originalFileName: data.originalFileName || null,
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
