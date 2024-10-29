import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { VST } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const vst = searchParams.get("vst") as VST | null;
  const presetType = searchParams.get("presetType");
  const tags = searchParams.get("tags");
  const searchInput = searchParams.get("searchInput") ?? "";

  try {
    console.log("Filtering with presetType:", presetType);
    const presets = await prisma.preset.findMany({
      where: {
        genre: genre ? { name: genre } : undefined,
        vst: vst ? vst : undefined,
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
            username: true,
            profileImage: true,
          },
        },
        genre: true,
      },
    });

    console.log("Fetched presets:", presets); // Debugging line
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
  const { userId } = await getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer profile not found" },
        { status: 404 }
      );
    }

    const vst = await prisma.vST.findFirst({
      where: {
        name: {
          equals: data.vstType,
          mode: "insensitive",
        },
      },
    });

    if (!vst) {
      console.log("VST not found for type:", data.vstType);
      return NextResponse.json(
        {
          error: "VST not found",
          details: `No VST found with name: ${data.vstType}`,
        },
        { status: 404 }
      );
    }

    const preset = await prisma.preset.create({
      data: {
        title: data.title,
        description: data.description,
        guide: data.guide,
        spotifyLink: data.spotifyLink || null,
        presetType: data.presetType,
        tags: Array.isArray(data.tags) ? data.tags : [data.tags],
        price: data.isFree ? 0 : data.price || 0,
        presetFileUrl: data.presetFileUrl,
        soundPreviewUrl: data.soundPreviewUrl || null,
        soundDesignerId: soundDesigner.id,
        vstId: vst.id,
        genreId: data.genre
          ? await prisma.genre
              .findUnique({
                where: { name: data.genre },
              })
              .then((genre) => genre?.id)
          : undefined,
      },
    });

    console.log("Created preset:", preset); // Debugging line
    return NextResponse.json(preset);
  } catch (error) {
    console.error("Error creating preset:", error);
    return NextResponse.json(
      { error: "Failed to create preset" },
      { status: 500 }
    );
  }
}
