import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PresetUpload } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("searchTerm") || "";
  const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
  const vstTypes =
    searchParams.get("vstTypes")?.split(",").filter(Boolean) || [];
  const presetTypes =
    searchParams.get("presetTypes")?.split(",").filter(Boolean) || [];
  const type = searchParams.get("type");

  try {
    const whereClause: any = {
      AND: [],
    };

    // Add presetType filter
    if (presetTypes.length > 0) {
      if (type === "packs") {
        whereClause.AND.push({
          presets: {
            some: {
              preset: {
                presetType: { in: presetTypes },
              },
            },
          },
        });
      } else {
        whereClause.AND.push({ presetType: { in: presetTypes } });
      }
    }

    // Modify search term filter to include preset titles
    if (searchTerm.trim()) {
      if (type === "packs") {
        whereClause.AND.push({
          OR: [
            { title: { contains: searchTerm.trim(), mode: "insensitive" } },
            {
              description: { contains: searchTerm.trim(), mode: "insensitive" },
            },
            {
              presets: {
                some: {
                  preset: {
                    title: { contains: searchTerm.trim(), mode: "insensitive" },
                  },
                },
              },
            },
          ],
        });
      } else {
        whereClause.AND.push({
          OR: [
            { title: { contains: searchTerm.trim(), mode: "insensitive" } },
            {
              description: { contains: searchTerm.trim(), mode: "insensitive" },
            },
          ],
        });
      }
    }

    // Add genre filter
    if (genres.length > 0) {
      if (type === "packs") {
        whereClause.AND.push({
          presets: {
            some: {
              preset: {
                genreId: { in: genres },
              },
            },
          },
        });
      } else {
        whereClause.AND.push({ genreId: { in: genres } });
      }
    }

    // Add VST type filter
    if (vstTypes.length > 0) {
      if (type === "packs") {
        whereClause.AND.push({
          presets: {
            some: {
              preset: {
                vst: {
                  type: { in: vstTypes },
                },
              },
            },
          },
        });
      } else {
        whereClause.AND.push({
          vst: {
            type: { in: vstTypes },
          },
        });
      }
    }

    // Remove AND array if empty
    if (whereClause.AND.length === 0) {
      delete whereClause.AND;
    }

    if (type === "packs") {
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
          soundDesigner: {
            select: {
              username: true,
              profileImage: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(packs);
    } else if (type === "requests") {
      const requests = await prisma.presetRequest.findMany({
        where: whereClause,
        include: {
          genre: true,
          soundDesigner: {
            select: {
              username: true,
              profileImage: true,
            },
          },
          submissions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(requests);
    } else {
      const presets = await prisma.presetUpload.findMany({
        where: whereClause,
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
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(presets);
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
