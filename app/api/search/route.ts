import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ItemType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawItemType = searchParams.get("itemType")?.toUpperCase();
    
    // Validate itemType
    if (!rawItemType || !Object.values(ItemType).includes(rawItemType as ItemType)) {
      return NextResponse.json(
        { error: `Invalid item type. Must be one of: ${Object.values(ItemType).join(', ')}` },
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

    // Only check auth for personal views
    const session =
      view === "UPLOADED" || view === "DOWNLOADED"
        ? await getServerSession(authOptions)
        : null;

    if ((view === "UPLOADED" || view === "DOWNLOADED") && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause: any = {
      AND: [],
    };

    // Add view-based filtering only if authenticated
    if (session?.user?.id) {
      if (view === "UPLOADED") {
        whereClause.AND.push({ userId: session.user.id });
      } else if (view === "DOWNLOADED") {
        whereClause.AND.push({
          downloads: {
            some: {
              userId: session.user.id,
            },
          },
        });
      }
    }

    // Add search filters
    if (searchTerm.trim()) {
      whereClause.AND.push({
        OR: [
          { title: { contains: searchTerm.trim(), mode: "insensitive" } },
          { description: { contains: searchTerm.trim(), mode: "insensitive" } },
        ],
      });
    }

    // Add genre filter
    if (genres.length > 0) {
      whereClause.AND.push({
        genreId: { in: genres },
      });
    }

    // Remove empty AND array
    if (whereClause.AND.length === 0) {
      delete whereClause.AND;
    }

    switch (itemType) {
      case ItemType.PRESET:
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
            ...(session?.user?.id
              ? {
                  downloads: {
                    where: {
                      userId: session.user.id,
                    },
                  },
                }
              : {}),
          },
          orderBy: { createdAt: "desc" },
        });
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
