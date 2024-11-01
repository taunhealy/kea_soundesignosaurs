import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        packId: params.id,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 2,
    });

    return NextResponse.json(priceHistory);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
