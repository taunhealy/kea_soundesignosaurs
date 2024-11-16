import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ItemType } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawItemType = searchParams.get("itemType")?.toUpperCase();

    // Validate itemType
    if (
      !rawItemType ||
      !Object.values(ItemType).includes(rawItemType as ItemType)
    ) {
      return NextResponse.json(
        {
          error: `Invalid item type. Must be one of: ${Object.values(
            ItemType
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const itemType = rawItemType as ItemType;
    const view = searchParams.get("view");
    const searchTerm = searchParams.get("searchTerm") || "";
    const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
    const vstTypes =
      searchParams.get("vstTypes")?.split(",").filter(Boolean) || [];
    const presetTypes =
      searchParams.get("presetTypes")?.split(",").filter(Boolean) || [];
    const status = searchParams.get("status");

    // Modify the session check to use the users id
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Only check auth for personal views
    if ((view === "UPLOADED" || view === "DOWNLOADED") && !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause = {
      ...(searchTerm && {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" as const } },
          { tags: { has: searchTerm } },
          {
            description: { contains: searchTerm, mode: "insensitive" as const },
          },
        ],
      }),
      // ... rest of the where clause conditions
    };

    console.log(
      "Search query whereClause:",
      JSON.stringify(whereClause, null, 2)
    );

    switch (itemType) {
      case ItemType.PRESET:
        console.log("Executing preset search...");
        const presets = await prisma.presetUpload.findMany({
          where: whereClause,
          include: {
            genre: true,
            vst: true,
            user: {
              select: {
                username: true,
                image: true,
              },
            },
            ...(userId
              ? {
                  downloads: {
                    where: {
                      userId: userId,
                    },
                  },
                }
              : {}),
          },
          orderBy: { createdAt: "desc" },
        });
        console.log(`Found ${presets.length} presets`);
        return NextResponse.json(presets);

      case ItemType.PACK:
        const packs = await prisma.presetPackUpload.findMany({
          where: whereClause,
          include: {
            presets: {
              include: {
                preset: {
                  include: {
                    genre: true,
                    vst: true,
                  },
                },
              },
            },
            user: {
              select: {
                username: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(packs);

      default:
        return NextResponse.json(
          { error: "Invalid item type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
