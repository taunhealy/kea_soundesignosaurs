import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const gear = await prisma.gear.findMany();
  return NextResponse.json(gear);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newGear = await prisma.gear.create({ data });
  return NextResponse.json(newGear);
}
