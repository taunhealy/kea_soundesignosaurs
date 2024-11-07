import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 9;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const type = searchParams.get("type");
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const whereClause =
      type === "downloaded"
        ? {
            downloads: {
              some: {
                userId,
              },
            },
          }
        : { userId };

    const [presets, totalCount] = await Promise.all([
      prisma.presetUpload.findMany({
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
        skip,
        take: ITEMS_PER_PAGE,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.presetUpload.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return NextResponse.json({
      presets,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}
