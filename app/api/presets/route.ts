import { createFilterClause } from "@/lib/queryHelpers";
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
    const filterClause = createFilterClause(params);

    console.log("Searching for presets with userId:", userId);
    console.log("Type parameter:", params.type);

    const results = await prisma.presetUpload.findMany({
      where: {
        ...filterClause,
        OR: [
          { userId: userId },
          { soundDesignerId: params.type === "uploaded" ? userId : undefined },
        ],
      },
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

    console.log("Found presets:", results);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error fetching presets:", error?.message || error);
    return new NextResponse("Failed to fetch presets", { status: 500 });
  }
}
