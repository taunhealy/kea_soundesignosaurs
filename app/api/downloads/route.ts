import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let downloads;
    if (type === "presets") {
      downloads = await prisma.preset.findMany({
        where: {
          soundDesigner: {
            userId: userId,
          },
        },
        select: {
          id: true,
          title: true,
          _count: {
            select: { downloads: true },
          },
        },
      });

      // Transform the data to match the expected format
      downloads = downloads.map((d) => ({
        id: d.id,
        title: d.title,
        downloadCount: d._count.downloads,
      }));
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(downloads);
  } catch (error) {
    console.error("Error fetching downloads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
