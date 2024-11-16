import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CartType } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        type: params.type.toUpperCase() as CartType,
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
                user: {
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
                user: {
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
      cart?.items.map((item) => {
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
            item.preset?.user?.username ?? item.pack?.user?.username ?? "",
          priceHistory: allPriceHistory,
          priceChange,
        };
      }) || [];

    return NextResponse.json(items);
  } catch (error) {
    console.error("Cart error:", error);
    return NextResponse.json(
      { error: `Failed to fetch ${params.type}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, from, to } = await request.json();

    // Log for debugging
    console.log("Moving item:", { itemId, from, to, userId });

    const result = await prisma.$transaction(async (tx) => {
      // Find the item in the source cart
      const item = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            userId: userId,
            type: from.toUpperCase() as CartType,
          },
        },
      });

      if (!item) {
        throw new Error("Item not found or unauthorized");
      }

      // Create or find destination cart
      const destCart = await tx.cart.upsert({
        where: {
          userId_type: {
            userId: userId,
            type: to.toUpperCase() as CartType,
          },
        },
        create: {
          userId: userId,
          type: to.toUpperCase() as CartType,
        },
        update: {},
      });

      // Move the item to the destination cart
      const movedItem = await tx.cartItem.update({
        where: { id: itemId },
        data: { cartId: destCart.id },
        include: {
          preset: true,
          pack: true,
        },
      });

      return movedItem;
    });

    return NextResponse.json({ success: true, item: result });
  } catch (error) {
    console.error("Cart operation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to move item" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartType = params.type.toUpperCase() as CartType;
    // Validate cart type
    if (!["CART", "WISHLIST"].includes(cartType)) {
      return NextResponse.json({ error: "Invalid cart type" }, { status: 400 });
    }

    const { presetId, packId } = await request.json();
    if (!presetId && !packId) {
      return NextResponse.json(
        { error: "Either preset ID or pack ID is required" },
        { status: 400 }
      );
    }

    const itemId = presetId || packId;
    const itemType = presetId ? "PRESET" : "PACK";

    // Check for existing item first
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cart: {
          userId: userId,
          type: cartType,
        },
        ...(itemType === "PRESET" ? { presetId: itemId } : { packId: itemId }),
      },
    });

    if (existingCartItem) {
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
            userId: userId,
            type: cartType,
          },
        },
        create: {
          userId,
          type: cartType,
        },
        update: {},
      });

      // Verify the item exists before creating the cart item
      if (presetId) {
        const preset = await tx.presetUpload.findUnique({
          where: { id: presetId },
        });
        if (!preset) {
          throw new Error("Preset not found");
        }
      } else if (packId) {
        const pack = await tx.presetPackUpload.findUnique({
          where: { id: packId },
        });
        if (!pack) {
          throw new Error("Pack not found");
        }
      }

      // Create cart item
      const cartItem = await tx.cartItem.create({
        data: {
          cartId: cart.id,
          itemType,
          [itemType === "PRESET" ? "presetId" : "packId"]: itemId,
          quantity: 1,
          priceHistory: {
            create: {
              price: presetId
                ? (
                    await tx.presetUpload.findUnique({
                      where: { id: presetId },
                    })
                  )?.price || 0
                : (
                    await tx.presetPackUpload.findUnique({
                      where: { id: packId },
                    })
                  )?.price || 0,
            },
          },
        },
        include: {
          priceHistory: true,
          preset: true,
          pack: true,
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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
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
            userId: userId,
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
