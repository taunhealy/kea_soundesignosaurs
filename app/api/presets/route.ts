import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const contentType = searchParams.get("contentType") || "presets";
    const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
    const vsts = searchParams.get("vsts")?.split(",").filter(Boolean) || [];
    const presetTypes =
      searchParams.get("presetTypes")?.split(",").filter(Boolean) || [];

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Base where clause
    const baseWhereClause: any = {};

    // Add filters if they exist
    if (genres.length > 0) {
      baseWhereClause.genre = {
        name: {
          in: genres,
        },
      };
    }

    if (vsts.length > 0) {
      baseWhereClause.vst = {
        name: {
          in: vsts,
        },
      };
    }

    if (presetTypes.length > 0) {
      baseWhereClause.presetType = {
        in: presetTypes,
      };
    }

    let results;
    if (contentType === "packs") {
      if (type === "uploaded") {
        const packWhereClause: any = {
          soundDesigner: {
            userId,
          },
        };

        // If we have genre filters, we need to filter packs that contain presets with those genres
        if (genres.length > 0) {
          packWhereClause.presets = {
            some: {
              preset: {
                genre: {
                  name: {
                    in: genres,
                  },
                },
              },
            },
          };
        }

        // Similar for VST filters
        if (vsts.length > 0) {
          packWhereClause.presets = {
            some: {
              preset: {
                vst: {
                  name: {
                    in: vsts,
                  },
                },
              },
            },
          };
        }

        // And preset type filters
        if (presetTypes.length > 0) {
          packWhereClause.presets = {
            some: {
              preset: {
                presetType: {
                  in: presetTypes,
                },
              },
            },
          };
        }

        results = await prisma.presetPack.findMany({
          where: packWhereClause,
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
      } else if (type === "downloaded") {
        // Handle downloaded packs logic here
        results = []; // Implement downloaded packs logic
      }
    } else {
      if (type === "uploaded") {
        results = await prisma.presetUpload.findMany({
          where: {
            AND: [{ soundDesigner: { userId } }, baseWhereClause],
          },
          include: {
            genre: true,
            vst: true,
            soundDesigner: true,
            packs: {
              include: {
                pack: {
                  include: {
                    presets: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } else if (type === "downloaded") {
        results = await prisma.download.findMany({
          where: {
            userId,
            preset: baseWhereClause,
          },
          include: {
            preset: {
              include: {
                genre: true,
                vst: true,
                soundDesigner: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }
    }

    console.log("Query params:", {
      type,
      genres,
      vsts,
      presetTypes,
      whereClause: baseWhereClause,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching presets:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
