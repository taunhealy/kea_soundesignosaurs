import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("[DEBUG] Preset-submissions API called");
  console.log("[DEBUG] Request URL:", request.url);
  console.log(
    "[DEBUG] Search Params:",
    new URL(request.url).searchParams.toString()
  );

  try {
    const results = await prisma.presetSubmission.findMany({
      include: {
        presetRequest: true,
        soundDesigner: true,
      },
    });

    console.log("[DEBUG] Found submissions:", results.length);
    return NextResponse.json(results);
  } catch (error) {
    console.error("[DEBUG] Preset-submissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset submissions" },
      { status: 500 }
    );
  }
}
