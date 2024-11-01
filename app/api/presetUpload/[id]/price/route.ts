import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { trackPriceChange } from "@/utils/ecommerce/priceTracking";
import { z } from "zod";

const priceSchema = z.object({
  price: z.number().min(5, "Price must be at least $5").max(1000),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`[PricePATCH] Updating price for preset ${params.id}`);

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("[PricePATCH] Received data:", data);

    const validatedPrice = priceSchema.parse({ price: data.price }).price;

    return await prisma.$transaction(async (tx) => {
      // Get current preset and verify ownership
      const currentPreset = await tx.presetUpload.findUnique({
        where: { id: params.id },
        include: {
          priceHistory: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });

      if (!currentPreset || currentPreset.soundDesignerId !== userId) {
        throw new Error("Unauthorized");
      }

      // Create price history for preset
      const lastPrice = currentPreset.priceHistory[0]?.price;
      if (!lastPrice || Number(lastPrice) !== validatedPrice) {
        const presetPriceHistory = await tx.priceHistory.create({
          data: {
            presetId: params.id,
            price: validatedPrice
          }
        });
        console.log("[PricePATCH] Created preset price history:", presetPriceHistory);
      }

      // Update preset price
      const updatedPreset = await tx.presetUpload.update({
        where: { id: params.id },
        data: { price: validatedPrice }
      });

      // Find and update cart items
      const cartItems = await tx.cartItem.findMany({
        where: { presetId: params.id },
        include: {
          priceHistory: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });

      console.log(`[PricePATCH] Found ${cartItems.length} cart items to update`);

      // Create price history for each cart item
      for (const item of cartItems) {
        const lastCartItemPrice = item.priceHistory[0]?.price;
        if (!lastCartItemPrice || Number(lastCartItemPrice) !== validatedPrice) {
          const cartItemPriceHistory = await tx.priceHistory.create({
            data: {
              cartItemId: item.id,
              price: validatedPrice
            }
          });
          console.log(`[PricePATCH] Created cart item price history:`, cartItemPriceHistory);
        }
      }

      return NextResponse.json({
        success: true,
        preset: updatedPreset,
        affectedCartItems: cartItems.length
      });
    });
  } catch (error) {
    console.error("[PricePATCH] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update price" },
      { status: 500 }
    );
  }
}
