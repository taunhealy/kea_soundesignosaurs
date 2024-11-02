import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CartItemType, CartType } from "@prisma/client";
import { z } from "zod";
import { PresetType } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const { userId } = await auth();
  const cartType = params.type;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: {
        userId_type: {
          userId,
          type: cartType.toUpperCase() as CartType,
        },
      },
      include: {
        items: {
          include: {
            priceHistory: {
              orderBy: {
                timestamp: "desc",
              },
            },
            preset: {
              include: {
                priceHistory: {
                  orderBy: {
                    timestamp: "desc",
                  },
                },
                soundDesigner: {
                  select: {
                    username: true,
                  },
                },
              },
            },
            pack: {
              include: {
                priceHistory: {
                  orderBy: {
                    timestamp: "desc",
                  },
                },
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

    console.log("Cart query result:", JSON.stringify(cart, null, 2));

    const items =
      cart?.items.map((item) => {
        // Combine all price histories
        const allPriceHistory = [
          ...(item.priceHistory ?? []),
          ...(item.preset?.priceHistory ?? []),
          ...(item.pack?.priceHistory ?? []),
        ]
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .map((history) => ({
            price: Number(history.price),
            timestamp: history.timestamp.toISOString(),
          }));

        // Get the last two entries from the combined history
        const [current, previous] = allPriceHistory;

        const priceChange =
          previous && current
            ? {
                oldPrice: previous.price,
                percentageChange:
                  ((current.price - previous.price) / previous.price) * 100,
              }
            : null;

        return {
          id: item.id,
          name: item.preset?.title ?? item.pack?.title ?? "",
          price: Number(item.preset?.price ?? item.pack?.price ?? 0),
          imageString:
            item.preset?.soundPreviewUrl ?? item.pack?.soundPreviewUrl ?? "",
          quantity: item.quantity,
          creator:
            item.preset?.soundDesigner?.username ??
            item.pack?.soundDesigner?.username ??
            "",
          priceHistory: allPriceHistory,
          priceChange,
        };
      }) || [];

    console.log("Server-side cart items:", JSON.stringify(items, null, 2));

    return NextResponse.json(items);
  } catch (error) {
    console.error(`Error fetching ${cartType}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${cartType}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, from, to } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // Get or create destination cart
      const destCart = await tx.cart.upsert({
        where: {
          userId_type: { userId, type: to },
        },
        create: { userId, type: to },
        update: {},
      });

      // Move the item
      const movedItem = await tx.cartItem.update({
        where: { id: itemId },
        data: { cartId: destCart.id },
      });

      return movedItem;
    });

    return NextResponse.json({ success: true, item: result });
  } catch (error) {
    console.error("Error moving item:", error);
    return NextResponse.json({ error: "Failed to move item" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartType = params.type.toUpperCase();
    // Validate cart type
    if (!["CART", "SAVED_FOR_LATER", "WISHLIST"].includes(cartType)) {
      return NextResponse.json({ error: "Invalid cart type" }, { status: 400 });
    }

    const { presetId, packId } = await request.json();
    if (!presetId && !packId) {
      return NextResponse.json(
        { error: "Either preset ID or pack ID is required" },
        { status: 400 }
      );
    }

    // Check for existing item first
    const existingCart = await prisma.cart.findFirst({
      where: {
        userId,
        type: cartType as CartType,
        items: {
          some: {
            OR: [{ preset: { id: presetId } }, { pack: { id: packId } }],
          },
        },
      },
    });

    if (existingCart) {
      return NextResponse.json(
        { error: `Item already exists in ${cartType.toLowerCase()}` },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get or create cart
      const cart = await tx.cart.upsert({
        where: {
          userId_type: {
            userId,
            type: cartType as CartType,
          },
        },
        create: {
          userId,
          type: cartType as CartType,
        },
        update: {},
      });

      // Get item price based on type
      let price: number | null = null;
      if (presetId) {
        const preset = await tx.presetUpload.findUnique({
          where: { id: presetId },
          select: { price: true },
        });
        if (!preset) {
          throw new Error("Preset not found");
        }
        price = preset.price || 0;
      } else if (packId) {
        const pack = await tx.presetPack.findUnique({
          where: { id: packId },
          select: { price: true },
        });
        if (!pack) {
          throw new Error("Pack not found");
        }
        price = pack.price || 0;
      }

      // Create cart item
      const cartItem = await tx.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          itemType: presetId ? "PRESET" : "PACK",
          itemId: presetId ?? packId,
          priceHistory: {
            create: {
              price: price || 0,
            },
          },
        },
        include: {
          priceHistory: true,
        },
      });

      return cartItem;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error adding item to ${params.type}:`, error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await request.json();

    await prisma.$transaction(async (tx) => {
      // First delete all price history records
      await tx.priceHistory.deleteMany({
        where: {
          cartItemId: itemId,
        },
      });

      // Then delete the cart item
      await tx.cartItem.delete({
        where: {
          id: itemId,
          cart: {
            userId,
            type: params.type.toUpperCase() as CartType,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${params.type} item:`, error);
    return NextResponse.json(
      { error: `Failed to delete item from ${params.type}` },
      { status: 500 }
    );
  }
}
