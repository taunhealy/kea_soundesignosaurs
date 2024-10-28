import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId: params.userId },
      include: {
        presets: {
          include: {
            genre: true,
            vst: true,
            soundDesigner: {
              select: {
                username: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(soundDesigner);
  } catch (error) {
    console.error("Error fetching sound designer profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

