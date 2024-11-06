import { NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the preset with all necessary information
    const preset = await prismaClient.presetUpload.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        presetFileUrl: true,
        originalFileName: true,
        title: true,
        priceType: true,
        soundDesignerId: true,
        soundDesigner: {
          select: {
            userId: true,
          },
        },
        downloads: {
          where: {
            userId: userId,
          },
        },
      },
    });

    console.log("Found preset:", preset); // Debug log

    if (!preset) {
      return new NextResponse(JSON.stringify({ error: "Preset not found" }), {
        status: 404,
      });
    }

    // Check if user has permission to download
    const isCreator = preset.soundDesigner?.userId === userId;
    const hasDownloadRecord = preset.downloads.length > 0;
    const isFree = preset.priceType === "FREE";

    const hasPermission = isCreator || hasDownloadRecord || isFree;

    console.log("Download permissions:", {
      isCreator,
      hasDownloadRecord,
      isFree,
      hasPermission,
    });

    if (!hasPermission) {
      return new NextResponse(
        JSON.stringify({ error: "Not authorized to download this preset" }),
        { status: 403 }
      );
    }

    if (!preset.presetFileUrl) {
      return new NextResponse(
        JSON.stringify({ error: "No file URL available" }),
        { status: 404 }
      );
    }

    // Create download record if it doesn't exist (except for creator)
    if (!isCreator && !hasDownloadRecord) {
      await prismaClient.presetDownload.create({
        data: {
          userId,
          presetId: preset.id,
        },
      });
    }

    return NextResponse.json({
      downloadUrl: preset.presetFileUrl,
      filename:
        preset.originalFileName ||
        `${preset.title}.preset` ||
        `preset_${preset.id}.preset`,
    });
  } catch (error) {
    console.error("[DOWNLOAD_PRESET] Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
