import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const { userId } = await auth();

  // Add your admin check here
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vsts = await prisma.vST.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(vsts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch VSTs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    // Convert the name to uppercase for enum consistency
    const vstName = name.toUpperCase();
    
    const vst = await prisma.vST.create({
      data: { name: vstName },
    });
    return NextResponse.json(vst);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create VST" },
      { status: 500 }
    );
  }
}
