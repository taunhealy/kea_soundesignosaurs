import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const vst = searchParams.get("vst");
  const searchInput = searchParams.get("searchInput") ?? "";

  try {
    const presets = await prisma.preset.findMany({
      where: {
        genre: { name: genre || undefined },
        vst: { name: vst || undefined },
        OR: [
          { title: { contains: searchInput, mode: "insensitive" } },
          { description: { contains: searchInput, mode: "insensitive" } },
        ],
      },
      include: {
        soundDesigner: {
          select: {
            name: true,
            profileImage: true,
          },
        },
        genre: true,
        vst: true,
      },
    });

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Error fetching presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}
