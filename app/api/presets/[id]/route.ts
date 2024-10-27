import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GenreType } from "@prisma/client";
import { Genre } from "@/app/types/enums";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Missing preset ID", { status: 400 });
    }

    console.log("Fetching preset with ID:", params.id);

    const preset = await prisma.preset.findUnique({
      where: {
        id: params.id,
      },
      include: {
        soundDesigner: {
          select: {
            name: true,
          },
        },
        genre: true,
      },
    });

    console.log("Fetched preset:", preset);

    if (!preset) {
      return new NextResponse("Preset not found", { status: 404 });
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error("[PRESET_GET] Detailed error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      params,
    });
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const id = params.id;

    console.log("Received data for update:", data);

    // Validate genre
    const genreValue = data.genre;
    const genreKey = Object.entries(Genre).find(([key, value]) => 
      value === genreValue || key === genreValue
    )?.[0];

    if (!genreKey) {
      return NextResponse.json({
        error: "Invalid genre",
        details: `Genre '${data.genre}' is not valid`,
      }, { status: 400 });
    }

    // Find or create genre
    let genre = await prisma.genre.findFirst({
      where: {
        OR: [
          { name: genreValue },
          { type: genreKey as GenreType }
        ]
      },
    });

    if (!genre) {
      genre = await prisma.genre.create({
        data: {
          name: genreValue,
          type: genreKey as GenreType,
          isCustom: false
        },
      });
    }

    // Update preset
    const updatedPreset = await prisma.preset.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        guide: data.guide,
        spotifyLink: data.spotifyLink || null,
        soundPreviewUrl: data.soundPreviewUrl || null,
        presetFileUrl: data.presetFileUrl,
        presetType: data.presetType,
        vstType: data.vstType,
        tags: Array.isArray(data.tags) ? data.tags : 
              typeof data.tags === "string" ? data.tags.split(",").map(tag => tag.trim()) : [],
        price: data.isFree ? 0 : data.price || 0,
        genreId: genre.id,
      },
      include: {
        genre: true,
        soundDesigner: {
          select: { name: true },
        },
      },
    });

    // Revalidate the path to ensure fresh data
    revalidatePath(`/presets/${id}`);
    
    return NextResponse.json(updatedPreset);
  } catch (error) {
    console.error("[PRESET_UPDATE] Error:", error);
    return NextResponse.json({
      error: "Failed to update preset",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
