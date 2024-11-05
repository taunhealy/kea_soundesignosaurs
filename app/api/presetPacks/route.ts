import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const presetPackSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(5),
  presetIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validated = presetPackSchema.parse(data);

    // Get the sound designer
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer profile not found" },
        { status: 404 }
      );
    }

    // Create the preset pack with connections
    const pack = await prisma.presetPackUpload.create({
      data: {
        title: validated.title,
        description: validated.description,
        price: validated.price,
        soundDesignerId: soundDesigner.id,
        presets: {
          create: validated.presetIds.map((presetId) => ({
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

    return NextResponse.json(pack);
  } catch (error) {
    console.error("Error creating preset pack:", error);
    return NextResponse.json(
      { error: "Failed to create preset pack" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm") || "";

    const packs = await prisma.presetPackUpload.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        soundDesigner: {
          select: {
            username: true,
            profileImage: true,
          },
        },
        presets: {
          include: {
            preset: {
              select: {
                id: true,
                title: true,
                soundPreviewUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
