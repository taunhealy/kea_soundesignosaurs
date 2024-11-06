import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// GET handler
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const presets = await prisma.presetUpload.findMany({
      where: {
        ...(type === "downloaded"
          ? {
              downloads: {
                some: {
                  userId,
                },
              },
            }
          : {
              userId,
            }),
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

    return NextResponse.json(presets);
  } catch (error) {
    console.error("[DEBUG] Preset upload GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: Request) {
  console.log("POST request received");

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // First, get the SoundDesigner record for this user
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "SoundDesigner profile not found" },
        { status: 404 }
      );
    }

    const data = await request.json();
    console.log("Received data:", data);

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create Stripe product if it's a premium preset
    let stripeProductId = null;
    if (data.priceType === "PREMIUM") {
      const stripeProduct = await stripe.products.create({
        name: data.title,
        description: data.description || "",
        default_price_data: {
          currency: 'usd',
          unit_amount: Math.round(data.price * 100), // Convert to cents
        },
      });
      stripeProductId = stripeProduct.id;
    }

    const preset = await prisma.presetUpload.create({
      data: {
        userId,
        stripeProductId,
        title: data.title,
        description: data.description || "",
        guide: data.guide || "",
        spotifyLink: data.spotifyLink || "",
        presetFileUrl: data.presetFileUrl || "",
        originalFileName: data.originalFileName || "",
        soundPreviewUrl: data.soundPreviewUrl || "",
        priceType: data.priceType || "FREE",
        price: data.priceType === "PREMIUM" ? Number(data.price) : 0,
        presetType: data.presetType || "LEAD",
        genreId: data.genreId || undefined,
        vstId: data.vstId || undefined,
        soundDesignerId: soundDesigner.id,
      },
      include: {
        soundDesigner: {
          select: {
            username: true,
          },
        },
        genre: true,
        vst: true,
      },
    });

    return NextResponse.json(preset);
  } catch (error) {
    console.error("[DEBUG] Preset upload POST error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create preset",
      },
      { status: 500 }
    );
  }
}
