import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("searchTerm") || "";
  const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
  const vstTypes =
    searchParams.get("vstTypes")?.split(",").filter(Boolean) || [];
  const presetTypes =
    searchParams.get("presetTypes")?.split(",").filter(Boolean) || [];

  try {
    const whereClause: any = {};
    const AND = [];

    // Only add search term if it exists
    if (searchTerm) {
      AND.push({
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }

    // Add other filters
    if (genres.length > 0) {
      AND.push({ genreId: { in: genres } });
    }

    if (vstTypes.length > 0) {
      AND.push({
        vst: {
          type: { in: vstTypes },
        },
      });
    }

    if (presetTypes.length > 0) {
      AND.push({ presetType: { in: presetTypes } });
    }

    // Only add AND clause if there are conditions
    if (AND.length > 0) {
      whereClause.AND = AND;
    }

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
  } catch (error) {
    console.error("Error fetching marketplace presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}
