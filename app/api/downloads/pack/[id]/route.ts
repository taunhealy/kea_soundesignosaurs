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

    // Get the pack with all presets
    const pack = await prismaClient.presetPackUpload.findUnique({
      where: {
        id: params.id,
      },
      include: {
        presets: {
          include: {
            preset: {
              select: {
                id: true,
                presetFileUrl: true,
                title: true,
                priceType: true,
                soundDesignerId: true,
                soundDesigner: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
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

    if (!pack) {
      return new NextResponse(JSON.stringify({ error: "Pack not found" }), {
        status: 404,
      });
    }

    // Check if user has permission to download
    const isCreator = pack.soundDesigner?.userId === userId;
    const hasDownloadRecord = pack.downloads.length > 0;
    const isFree = pack.priceType === "FREE";

    const hasPermission = isCreator || hasDownloadRecord || isFree;

    if (!hasPermission) {
      return new NextResponse(
        JSON.stringify({ error: "Not authorized to download this pack" }),
        { status: 403 }
      );
    }

    // Get all preset URLs from the pack
    const presets = pack.presets.map((item) => ({
      url: item.preset.presetFileUrl,
      title: item.preset.title,
    }));

    if (presets.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "No preset files available in this pack" }),
        { status: 404 }
      );
    }

    // Create download record if it doesn't exist (except for creator)
    if (!isCreator && !hasDownloadRecord) {
      await prismaClient.presetPackDownload.create({
        data: {
          userId,
          packId: pack.id,
        },
      });
    }

    return NextResponse.json({
      presets,
      packTitle: pack.title,
    });
  } catch (error) {
    console.error("[DOWNLOAD_PACK] Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}