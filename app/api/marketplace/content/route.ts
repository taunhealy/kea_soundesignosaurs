import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ContentType } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("contentType") as ContentType;
  
  // Extract filter parameters
  const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
  const vstTypes = searchParams.get("vstTypes")?.split(",").filter(Boolean) || [];
  const presetTypes = searchParams.get("presetTypes")?.split(",").filter(Boolean) || [];
  const searchTerm = searchParams.get("searchTerm") || "";

  try {
    switch (contentType) {
      case ContentType.PRESETS:
        const whereClause: any = {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        };

        // Add filter conditions
        const AND = [];

        if (genres.length > 0) {
          AND.push({ genreId: { in: genres } });
        }

        if (vstTypes.length > 0) {
          AND.push({ vstId: { in: vstTypes } });
        }

        if (presetTypes.length > 0) {
          AND.push({ presetType: { in: presetTypes } });
        }

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

      default:
        return NextResponse.json(
          { error: `Unsupported content type: ${contentType}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching marketplace content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
