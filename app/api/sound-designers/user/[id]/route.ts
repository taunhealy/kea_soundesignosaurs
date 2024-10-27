import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const soundDesigner = await prisma.soundDesigner.findUnique({
      where: {
        userId: params.id
      }
    });

    if (!soundDesigner) {
      return NextResponse.json(
        { error: "Sound designer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(soundDesigner);
  } catch (error) {
    console.error("Error fetching sound designer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Try to find existing sound designer
    let soundDesigner = await prisma.soundDesigner.findUnique({
      where: {
        userId: params.id
      }
    });

    // If not found, create new sound designer
    if (!soundDesigner) {
      soundDesigner = await prisma.soundDesigner.create({
        data: {
          userId: params.id,
          name: body.name,
          email: body.email,
          profileImage: body.profileImage
        }
      });
    }

    return NextResponse.json(soundDesigner);
  } catch (error) {
    console.error("Error creating sound designer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
