import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { userId } = await auth();
  console.log("User ID:", userId); // Add this line to log the userId
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let presets;
    if (type === "downloaded") {
      presets = await prisma.download.findMany({
        where: {
          userId: userId,
          presetId: { not: null },
        },
        include: { preset: true },
      });
      presets = presets.map((download) => download.preset);
    } else if (type === "uploaded") {
      // First, get the soundDesigner associated with this user
      const soundDesigner = await prisma.soundDesigner.findUnique({
        where: { userId },
        include: {
          presets: {
            select: {
              id: true,
              title: true,
              price: true,
              soundPreviewUrl: true,
              spotifyLink: true,
              downloads: true,
              genre: {
                select: {
                  id: true,
                  name: true,
                },
              },
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
      presets = soundDesigner?.presets || [];
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Error fetching presets:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
