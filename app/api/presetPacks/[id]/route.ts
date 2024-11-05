import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the sound designer first
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer profile not found" },
        { status: 404 }
      );
    }

    const packs = await prisma.presetPackUpload.findMany({
      where: {
        soundDesignerId: soundDesigner.id,
      },
      include: {
        presets: {
          include: {
            preset: true,
          },
        },
        soundDesigner: {
          select: {
            username: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(packs);
  } catch (error) {
    console.error("Error fetching preset packs:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset packs" },
      { status: 500 }
    );
  }
}
