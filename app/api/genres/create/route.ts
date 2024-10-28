import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isSystemGenre, SystemGenres } from "@/types/enums";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    // Check if genre already exists
    const existingGenre = await prisma.genre.findFirst({
      where: { name },
    });

    if (existingGenre) {
      return NextResponse.json(existingGenre);
    }

    // Determine if it's a system genre
    const isSystem = isSystemGenre(name);

    // Create new genre
    const genre = await prisma.genre.create({
      data: {
        name,
        type: isSystem ? name : 'CUSTOM',
        isSystem,
      },
    });

    return NextResponse.json(genre);
  } catch (error) {
    console.error("Error creating genre:", error);
    return NextResponse.json(
      { error: "Failed to create genre" },
      { status: 500 }
    );
  }
}
