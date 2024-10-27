import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vsts = await prisma.vST.findMany();  // Change to VST
    return NextResponse.json(vsts);
  } catch (error) {
    console.error("Error fetching VSTs:", error);
    return NextResponse.json(
      { error: "Failed to fetch VSTs" },
      { status: 500 }
    );
  }
}
