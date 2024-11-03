import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const downloads = await prisma.download.findMany({
      where: {
        userId: userId,
      },
      include: {
        preset: {
          select: {
            id: true,
            title: true,
            description: true,
            presetFileUrl: true,
            soundDesigner: {
              select: {
                username: true,
              },
            },
          },
        },
        pack: {
          select: {
            id: true,
            title: true,
            description: true,
            downloads: true,
            soundDesigner: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(downloads);
  } catch (error) {
    console.error("Error fetching downloads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
