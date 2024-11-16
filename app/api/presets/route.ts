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
  itemType: z.string().default("PRESET"),
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    const where = {
      ...(view === "UPLOADED"
        ? {
            userId: session.user.id,
          }
        : view === "DOWNLOADED"
        ? {
            downloads: {
              some: {
                userId: session.user.id,
              },
            },
          }
        : {}),
    };

    const presets = await prisma.presetUpload.findMany({
      where,
      include: {
        genre: true,
        vst: true,
        user: {
          select: {
            username: true,
            image: true,
          },
        },
        downloads: {
          where: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
