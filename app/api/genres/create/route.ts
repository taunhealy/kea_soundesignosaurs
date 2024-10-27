import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    // Check if genre already exists
    const existingGenre = await prisma.genre.findUnique({
      where: { name }
    });

    if (existingGenre) {
      return NextResponse.json(existingGenre);
    }

    // Create new genre
    const genre = await prisma.genre.create({
      data: {
        name,
        isCustom: true
      }
    });

    return NextResponse.json(genre);
  } catch (error) {
    console.error("Error creating genre:", error);
    return NextResponse.json({ error: "Failed to create genre" }, { status: 500 });
  }
}

