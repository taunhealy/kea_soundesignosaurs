import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { VSTType } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const vst = searchParams.get("vst") as VSTType | null;
  const presetType = searchParams.get("presetType");
  const tags = searchParams.get("tags");
  const searchInput = searchParams.get("searchInput") ?? "";

  try {
    const presets = await prisma.preset.findMany({
      where: {
        genre: genre ? { name: genre } : undefined, // Handle optional genre
        vstType: vst ? vst : undefined,
        presetType: presetType || undefined,
        tags: tags ? { hasSome: tags.split(",") } : undefined,
        OR: [
          { title: { contains: searchInput, mode: "insensitive" } },
          { description: { contains: searchInput, mode: "insensitive" } },
          { guide: { contains: searchInput, mode: "insensitive" } },
        ],
      },
      include: {
        soundDesigner: {
          select: {
            name: true,
            profileImage: true,
          },
        },
        genre: true,
      },
    });

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Error fetching presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const { userId } = auth;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // First, get or create the sound designer
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer profile not found" },
        { status: 404 }
      );
    }

    // Get the VST by name (case-insensitive)
    const vst = await prisma.vST.findFirst({
      where: {
        name: {
          equals: data.vstType,
          mode: "insensitive",
        },
      },
    });

    if (!vst) {
      return NextResponse.json({ error: "VST not found" }, { status: 404 });
    }

    // Create the preset with both connections
    const preset = await prisma.preset.create({
      data: {
        title: data.title,
        description: data.description,
        guide: data.guide,
        spotifyLink: data.spotifyLink || null,
        genreId: data.genreId,
        vstType: data.vstType,
        presetType: data.presetType,
        tags: data.tags,
        price: data.isFree ? 0 : data.price || 0,
        presetFileUrl: data.presetFileUrl,
        soundDesigner: {
          connect: {
            id: soundDesigner.id,
          },
        },
        vst: {
          connect: {
            id: vst.id,
          },
        },
        ...(data.soundPreviewUrl && { soundPreviewUrl: data.soundPreviewUrl }), // Only include if provided
      },
    });

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Error creating preset:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
