import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const searchInput = searchParams.get("searchInput");

  try {
    const samples = await prisma.sample.findMany({
      where: {
        genre: { name: genre || undefined },
        OR: searchInput ? [
          { title: { contains: searchInput, mode: "insensitive" } },
          { description: { contains: searchInput, mode: "insensitive" } },
        ] : undefined,
      },
      include: {
        soundDesigner: {
          select: {
            name: true,
            profileImage: true,
          },
        },
        genre: true,
      },
    });

    return NextResponse.json(samples);
  } catch (error) {
    console.error("Error fetching samples:", error);
    return NextResponse.json({ error: "Failed to fetch samples" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  try {
    const newSample = await prisma.sample.create({
      data: {
        ...data,
        soundDesigner: { connect: { userId } },
      },
    });
    return NextResponse.json(newSample, { status: 201 });
  } catch (error) {
    console.error("Error creating sample:", error);
    return NextResponse.json({ error: "Failed to create sample" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  try {
    const updatedSample = await prisma.sample.update({
      where: { id: data.id },
      data: {
        ...data,
        soundDesigner: { connect: { userId } },
      },
    });
    return NextResponse.json(updatedSample);
  } catch (error) {
    console.error("Error updating sample:", error);
    return NextResponse.json({ error: "Failed to update sample" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Sample ID is required" }, { status: 400 });
  }

  try {
    await prisma.sample.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Sample deleted successfully" });
  } catch (error) {
    console.error("Error deleting sample:", error);
    return NextResponse.json({ error: "Failed to delete sample" }, { status: 500 });
  }
}
