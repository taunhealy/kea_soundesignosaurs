import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre");
  const vsts = searchParams.get("vst")?.split(",");
  const presetTypes = searchParams.get("presetTypes")?.split(",");

  try {
    const results = await prisma.preset.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        genre: genre ? { name: { equals: genre } } : undefined,
        vst:
          vsts && vsts.length > 0
            ? {
                name: { in: vsts },
              }
            : undefined,
        presetType:
          presetTypes && presetTypes.length > 0
            ? { in: presetTypes }
            : undefined,
      },
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
    });

    console.log("API Results:", JSON.stringify(results, null, 2));
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
