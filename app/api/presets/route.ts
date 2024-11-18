import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define validation schema
const presetSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  guide: z.string().optional(),
  spotifyLink: z.string().optional(),
  genreId: z.string().min(1),
  vstId: z.string().min(1),
  priceType: z.enum(["FREE", "PREMIUM"]).default("FREE"),
  presetType: z.enum(["PAD", "LEAD", "PLUCK", "BASS", "FX", "OTHER"]),
  price: z.number().min(0),
  presetFileUrl: z.string().min(1),
  originalFileName: z.string().optional(),
  soundPreviewUrl: z.string().optional(),
  itemType: z.enum(["PRESET"]).default("PRESET"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("Unauthorized session:", session); // Debug log
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          email: session.user.email!,
          name: session.user.name!,
          image: session.user.image,
        },
      });
      console.log("Created new user in API route:", user);
    }

    const body = await request.json();
    console.log("Request body:", body);

    const validatedData = presetSchema.parse(body);

    // Add VST validation
    const vst = await prisma.vST.findUnique({
      where: { id: validatedData.vstId },
    });

    if (!vst) {
      return NextResponse.json(
        { error: "Invalid VST selected" },
        { status: 400 }
      );
    }

    // Create preset using the user's database ID
    const preset = await prisma.presetUpload.create({
      data: {
        ...validatedData,
        userId: user.id, // Use the database user ID
      },
    });

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Error in POST /api/presets:", error);
    return NextResponse.json(
      {
        error: "Failed to create preset",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    // Check auth only for user-specific views
    if ((view === "UPLOADED" || view === "DOWNLOADED") && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where = {
      ...(view === "UPLOADED"
        ? {
            userId: session?.user?.id,
          }
        : view === "DOWNLOADED"
        ? {
            downloads: {
              some: {
                userId: session?.user?.id,
              },
            },
          }
        : {}),
    };

    const presets = await prisma.presetUpload.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        genre: true,
        vst: true,
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        userId: true,
        _count: {
          select: {
            downloads: session?.user?.id
              ? {
                  where: {
                    userId: session.user.id,
                  },
                }
              : false,
          },
        },
      },
    });

    // Simple transform with direct property access
    const presetsWithAuth = presets.map((preset) => ({
      ...preset,
      isOwner: preset.userId === session?.user?.id,
      isDownloaded: preset._count?.downloads > 0,
      _count: undefined,
    }));

    return NextResponse.json(presetsWithAuth);
  } catch (error) {
    console.error("Error in GET /api/presets:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch presets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
