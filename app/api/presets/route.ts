import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let whereClause: any = {};

  if (type === "downloaded") {
    whereClause = {
      downloads: {
        some: {
          userId: userId,
        },
      },
    };
  }

  try {
    const presets = await prisma.presetUpload.findMany({
      where: whereClause,
      include: {
        soundDesigner: {
          select: {
            username: true,
          },
        },
        vst: true,
        downloads: {
          where: {
            userId: userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
