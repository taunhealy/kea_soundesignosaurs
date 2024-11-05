import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = Object.fromEntries(new URL(request.url).searchParams);
    const where: any = {};

    // If type is 'uploaded', only show user's uploads
    if (params.type === "uploaded") {
      where.userId = userId;
    }

    // Handle price types as an array for the enum
    if (params.priceTypes && params.priceTypes !== "") {
      where.priceType = {
        in: params.priceTypes.split(","),
      };
    }

    // Handle VST types
    if (params.vstTypes && params.vstTypes !== "") {
      where.vst = {
        type: {
          in: params.vstTypes.split(","),
        },
      };
    }

    // Handle genres as an array
    if (params.genres && params.genres !== "") {
      where.genreId = {
        in: params.genres.split(","),
      };
    }

    // Handle preset types as an array
    if (params.presetTypes && params.presetTypes !== "") {
      where.presetType = {
        in: params.presetTypes.split(","),
      };
    }

    console.log("Final where clause:", where);

    const results = await prisma.presetUpload.findMany({
      where,
      include: {
        soundDesigner: {
          select: { username: true, profileImage: true },
        },
        genre: true,
        vst: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error fetching presets:", error?.message || error);
    return new NextResponse("Failed to fetch presets", { status: 500 });
  }
}
