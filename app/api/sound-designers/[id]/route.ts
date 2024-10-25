import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const soundDesigner = await prisma.soundDesigner.findUnique({
    where: { id: params.id },
    include: { presets: true, samples: true, tutorials: true },
  });

  if (!soundDesigner) {
    return NextResponse.json(
      { error: "Sound designer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(soundDesigner);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();

  const updatedSoundDesigner = await prisma.soundDesigner.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updatedSoundDesigner);
}
