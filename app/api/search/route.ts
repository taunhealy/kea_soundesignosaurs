import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PresetUpload } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
    const vstTypes =
      searchParams.get("vstTypes")?.split(",").filter(Boolean) || [];
    const priceTypes =
      searchParams.get("priceTypes")?.split(",").filter(Boolean) || [];
    const presetTypes =
      searchParams.get("presetTypes")?.split(",").filter(Boolean) || [];

    const whereClause: any = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    const AND = [];

    if (genres.length > 0) {
      AND.push({
        genreId: { in: genres },
      });
    }

    if (vstTypes.length > 0) {
      AND.push({
        vst: {
          type: { in: vstTypes },
        },
      });
    }

    if (priceTypes.length > 0) {
      AND.push({
        priceType: { in: priceTypes },
      });
    }

    if (presetTypes.length > 0) {
      AND.push({
        presetType: { in: presetTypes },
      });
    }

    if (AND.length > 0) {
      whereClause.AND = AND;
    }

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

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search presets" },
      { status: 500 }
    );
  }
}
