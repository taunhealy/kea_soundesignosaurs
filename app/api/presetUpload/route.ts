import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { PresetType } from "@prisma/client";

const priceSchema = z.object({
  price: z.number().min(5, "Price must be at least $5"),
});

const presetUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  guide: z.string().optional(),
  spotifyLink: z.string().optional().nullable(),
  soundPreviewUrl: z.string().optional().nullable(),
  presetFileUrl: z.string(),
  originalFileName: z.string().optional().nullable(),
  presetType: z.nativeEnum(PresetType),
  tags: z.array(z.string()).optional(),
  genreId: z.string().optional().nullable(),
  vstId: z.string().optional().nullable(),
  priceType: z.enum(['FREE', 'PREMIUM']),
  price: z.number().min(5, "Price must be at least $5").nullable().optional(),
  quantity: z.number().min(1).default(1),
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

    try {
      const validated = presetUploadSchema.parse(data);

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

      const preset = await prisma.presetUpload.create({
        data: {
          ...validated,
          soundDesignerId: soundDesigner.id,
        },
      });

      return NextResponse.json(preset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }
      console.error("Server error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
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
