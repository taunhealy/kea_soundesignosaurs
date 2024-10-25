import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre");
  const vst = searchParams.get("vst");
  const type = searchParams.get("type");

  try {
    const results = await prisma.preset.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        genre: genre ? { name: genre } : undefined,
        vst: vst ? { name: vst } : undefined,
        // type: type || undefined,
      },
      include: {
        soundDesigner: {
          select: { name: true, profileImage: true },
        },
        genre: true,
        vst: true,
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
