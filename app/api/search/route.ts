import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PresetType } from "@/types/PresetTypes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
    const vsts = searchParams.get("vsts")?.split(",").filter(Boolean) || [];
    const presetTypes = searchParams.get("presetTypes")?.split(",").filter(Boolean) || [];

    const whereClause: any = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    // Add filters only if they're not empty
    const AND = [];

    if (genres.length > 0) {
      AND.push({
        genre: {
          name: {
            in: genres,
          },
        },
      });
    }

    if (vsts.length > 0) {
      AND.push({
        vst: {
          name: {
            in: vsts,
          },
        },
      });
    }

    if (presetTypes.length > 0) {
      AND.push({
        presetType: {
          in: presetTypes,
        },
      });
    }

    if (AND.length > 0) {
      whereClause.AND = AND;
    }

    console.log('Search query whereClause:', JSON.stringify(whereClause, null, 2));

    const results = await prisma.presetUpload.findMany({
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

    console.log(`Found ${results.length} results`);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error details:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
