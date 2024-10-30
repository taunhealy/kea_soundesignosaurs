import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let presets;
    if (type === "uploaded") {
      presets = await prisma.presetUpload.findMany({
        where: {
          soundDesigner: {
            userId: userId,
          },
        },
        include: {
          genre: true,
          vst: true,
          soundDesigner: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (type === "downloaded") {
      presets = await prisma.download.findMany({
        where: {
          userId: userId,
        },
        include: {
          preset: {
            include: {
              genre: true,
              vst: true,
              soundDesigner: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Error fetching presets:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
