import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ItemType } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ItemType;

  try {
    let tags: string[] = [];
    
    switch (type) {
      case ItemType.PRESET:
        const presetTags = await prisma.presetUpload.findMany({
          select: { tags: true },
          distinct: ['tags'],
        });
        tags = [...new Set(presetTags.flatMap(p => p.tags))];
        break;
        
      case ItemType.PACK:
        const packTags = await prisma.presetPackUpload.findMany({
          select: { tags: true },
          distinct: ['tags'],
        });
        tags = [...new Set(packTags.flatMap(p => p.tags))];
        break;
        
      case ItemType.REQUEST:
        const requestTags = await prisma.presetRequest.findMany({
          select: { tags: true },
          distinct: ['tags'],
        });
        tags = [...new Set(requestTags.flatMap(p => p.tags))];
        break;
    }
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
