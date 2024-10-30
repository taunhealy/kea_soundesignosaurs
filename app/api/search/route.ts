import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PresetType } from "@/types/PresetTypes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const genre = searchParams.get("genre");
    const vst = searchParams.get("vst");
    const presetType = searchParams.get("presetType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const whereClause: { OR: any[]; AND?: any[] } = {
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
      ],
      AND: [
        ...(genre ? [{ genre: { name: genre } }] : []),
        ...(vst ? [{ vst: { name: vst } }] : []),
        ...(presetType ? [{ presetType: presetType as PresetType }] : []),
      ],
    };

    if (whereClause.AND?.length === 0) {
      delete whereClause.AND;
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
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error details:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
