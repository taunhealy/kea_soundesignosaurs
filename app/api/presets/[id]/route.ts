import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Missing preset ID", { status: 400 });
    }

    // Validate ID format if you're using specific ID patterns
    if (typeof params.id !== 'string') {
      return new NextResponse("Invalid preset ID format", { status: 400 });
    }

    const preset = await prisma.preset.findUnique({
      where: {
        id: params.id,
      },
      include: {
        soundDesigner: {
          select: {
            username: true,
            profileImage: true,
          },
        },
        vst: true,
        genre: true,
      },
    });

    if (!preset) {
      return new NextResponse("Preset not found", { status: 404 });
    }

    // Format the data to match what PresetForm expects
    const formattedPreset = {
      ...preset,
      vstType: preset.vst?.name ?? "",
      genre: preset.genre?.name ?? "",
      isFree: preset.price === 0,
      // Use nullish coalescing operator for better null/undefined handling
      title: preset.title ?? "",
      description: preset.description ?? "",
      guide: preset.guide ?? "",
      spotifyLink: preset.spotifyLink ?? "",
      presetFileUrl: preset.presetFileUrl ?? "",
      soundPreviewUrl: preset.soundPreviewUrl ?? "",
      price: preset.price ?? 0,
      tags: preset.tags ?? [],
      presetType: preset.presetType ?? "",
    };

    return NextResponse.json(formattedPreset);
  } catch (error) {
    // Enhanced error logging
    console.error("[PRESET_GET] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      params,
      errorType: error?.constructor?.name,
      timestamp: new Date().toISOString(),
    });

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("prisma")) {
        return new NextResponse("Database error", { status: 500 });
      }
    }

    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate that the preset exists and belongs to the user
    const existingPreset = await prisma.preset.findFirst({
      where: {
        id: params.id,
        soundDesigner: {
          userId: userId,
        },
      },
    });

    if (!existingPreset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Update the preset
    const updatedPreset = await prisma.preset.update({
      where: { id: params.id },
      data: {
        title: data.title,
        price: data.price,
        soundPreviewUrl: data.soundPreviewUrl,
        spotifyLink: data.spotifyLink,
        genreId: data.genreId,
        presetFileUrl: data.presetFileUrl,
        presetType: data.presetType,
        tags: data.tags,
        vstId: data.vstId,
      },
      include: {
        genre: true,
        soundDesigner: true,
        vst: true,
      },
    });

    revalidatePath(`/presets/${params.id}`);
    return NextResponse.json(updatedPreset);
  } catch (error) {
    console.error("Error updating preset:", error);
    return NextResponse.json(
      { error: "Failed to update preset", details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const preset = await prisma.preset.findUnique({
      where: { id: params.id },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    await prisma.preset.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting preset:", error);
    return NextResponse.json(
      { error: "Failed to delete preset" },
      { status: 500 }
    );
  }
}
