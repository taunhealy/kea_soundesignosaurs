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
  const status = searchParams.get("status");
  const view = searchParams.get("view");
  const userId = searchParams.get("userId");
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

  console.log("[DEBUG] Search params:", {
    type,
    view,
    userId,
    status,
    presetTypes,
  });

  try {
    const whereClause: any = {
      AND: [],
    };

    // Add view-based filtering for requests
    if (type === "requests" && userId) {
      // First get the soundDesigner for the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        // If no soundDesigner found, return empty results
        return NextResponse.json([]);
      }

      if (view === "assisted") {
        whereClause.AND.push({
          submissions: {
            some: {
              user: {
                id: userId,
              },
            },
          },
        });
      } else if (view === "requested") {
        whereClause.AND.push({
          user: {
            id: userId,
          },
        });
      }
    }

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

    // Add search term filter
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

    // Add status filter
    if (status) {
      whereClause.AND.push({ status: status.toUpperCase() });
    }

    // Add tags filter
    if (tags.length > 0) {
      whereClause.AND.push({
        tags: {
          hasSome: tags
        }
      });
    }

    // Remove AND array if empty
    if (whereClause.AND.length === 0) {
      delete whereClause.AND;
    }

    console.log(
      "[DEBUG] Final where clause:",
      JSON.stringify(whereClause, null, 2)
    );

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
          user: {
            select: {
              username: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(packs);
    } else if (type === "requests") {
      console.log("Fetching requests with params:", searchParams.toString());
      const requests = await prisma.presetRequest.findMany({
        where: whereClause,
        include: {
          genre: true,
          user: {
            select: {
              username: true,
              image: true,
            },
          },
          submissions: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      console.log("Found requests:", requests.length);
      return NextResponse.json(requests);
    } else {
      const presets = await prisma.presetUpload.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              username: true,
              image: true,
            },
          },
          genre: true,
          vst: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log("whereClause:", whereClause);
      console.log("Number of presets found:", presets.length);

      return NextResponse.json(presets);
    }
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
