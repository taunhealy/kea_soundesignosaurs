import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CartType } from "@prisma/client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId_type: {
          userId,
          type: "WISHLIST",
        },
      },
      include: {
        items: {
          include: {
            preset: {
              select: {
                title: true,
                price: true,
                soundPreviewUrl: true,
                soundDesigner: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const items =
      cart?.items.map((item) => ({
        id: item.id,
        presetId: item.presetId,
        name: item.preset?.title || "",
        price: item.preset?.price || 0,
        imageString: item.preset?.soundPreviewUrl || "",
        quantity: item.quantity,
        creator: item.preset?.soundDesigner?.username || "Unknown",
      })) || [];

    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { presetId } = await request.json();
    if (!presetId) {
      return NextResponse.json(
        { error: "Preset ID is required" },
        { status: 400 }
      );
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.cart.findFirst({
      where: {
        userId,
        type: "WISHLIST",
        items: {
          some: {
            itemId: presetId,
            itemType: "PRESET"
          }
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get or create wishlist cart
      const cart = await tx.cart.upsert({
        where: {
          userId_type: {
            userId,
            type: "WISHLIST",
          },
        },
        create: {
          userId,
          type: "WISHLIST",
        },
        update: {},
      });

      // Create cart item
      const cartItem = await tx.cartItem.create({
        data: {
          cartId: cart.id,
          presetId,
        },
        include: {
          preset: {
            include: {
              soundDesigner: true,
            },
          },
        },
      });

      return cartItem;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Wishlist POST error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
