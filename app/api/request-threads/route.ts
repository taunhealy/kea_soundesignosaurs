import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const requestThread = await prisma.requestThread.create({
      data: {
        title: data.title,
        youtubeLink: data.youtubeLink || null,
        genre: data.genre,
        enquiryDetails: data.enquiryDetails,
        userId: userId,
        status: "OPEN",
      },
    });

    return NextResponse.json(requestThread);
  } catch (error) {
    console.error("Error creating request thread:", error);
    return NextResponse.json(
      { error: "Failed to create request thread" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const results = await prisma.$queryRaw`
      SELECT 
        r.*,
        ts_rank(to_tsvector('english', r.title || ' ' || r."enquiryDetails" || ' ' || COALESCE(g.name, '')), plainto_tsquery('english', ${query})) as rank
      FROM "RequestThread" r
      LEFT JOIN "Genre" g ON r."genre" = g.name
      WHERE 
        ${
          query
            ? Prisma.sql`
          to_tsvector('english', r.title || ' ' || r."enquiryDetails" || ' ' || COALESCE(g.name, '')) @@ plainto_tsquery('english', ${query})
        `
            : Prisma.sql`1=1`
        }
        ${genre ? Prisma.sql`AND r.genre = ${genre}` : Prisma.sql``}
      ORDER BY 
        ${query ? Prisma.sql`rank DESC` : Prisma.sql`r."createdAt" DESC`}
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit}
    `;

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
