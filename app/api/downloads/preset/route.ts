import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    // Verify the preset exists and is free
    const preset = await prisma.presetUpload.findUnique({
      where: { id },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    if (preset.priceType !== "FREE") {
      return NextResponse.json({ error: "Preset is not free" }, { status: 403 });
    }

    // Create download record
    await prisma.presetDownload.create({
      data: {
        userId,
        presetId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error downloading preset:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
