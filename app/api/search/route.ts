import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre");
  const vst = searchParams.get("vst");
  const presetType = searchParams.get("presetType");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const results = await prisma.$queryRaw`
      SELECT 
        p.*,
        ts_rank(to_tsvector('english', 
          p.title || ' ' || 
          p.description || ' ' || 
          COALESCE(g.name, '') || ' ' ||
          COALESCE(p."presetType", '')
        ), plainto_tsquery('english', ${query})) as rank
      FROM "Preset" p
      LEFT JOIN "Genre" g ON p."genreId" = g.id
      WHERE 
        to_tsvector('english', 
          p.title || ' ' || 
          p.description || ' ' || 
          COALESCE(g.name, '') || ' ' ||
          COALESCE(p."presetType", '')
        ) @@ plainto_tsquery('english', ${query})
        ${genre ? Prisma.sql`AND "genreId" = ${genre}` : Prisma.sql``}
        ${vst ? Prisma.sql`AND "vstType" = ${vst}` : Prisma.sql``}
        ${
          presetType
            ? Prisma.sql`AND "presetType" = ${presetType}`
            : Prisma.sql``
        }
      ORDER BY rank DESC
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit}
    `;

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
