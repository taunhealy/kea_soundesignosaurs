import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const userId = searchParams.get("userId");

  console.log("[DEBUG] PresetRequests API called");
  console.log("[DEBUG] Search Params:", { type, userId });

  try {
    let requests = await prisma.presetRequest.findMany({
      include: {
        genre: true,
        soundDesigner: {
          select: {
            username: true,
          },
        },
        submissions: true,
      },
    });

    console.log("[DEBUG] Database query results:", requests);
    return NextResponse.json(requests || []);
  } catch (error) {
    console.error("[DEBUG] PresetRequests API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.genreId || !data.enquiryDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const presetRequest = await prisma.presetRequest.create({
      data: {
        userId,
        title: data.title,
        youtubeLink: data.youtubeLink || null,
        genreId: data.genreId,
        enquiryDetails: data.enquiryDetails,
        status: "OPEN",
      },
      include: {
        genre: true,
        soundDesigner: true,
      },
    });

    const headers = new Headers();
    headers.append("Cache-Control", "no-cache, no-store, must-revalidate");

    return NextResponse.json(presetRequest, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
