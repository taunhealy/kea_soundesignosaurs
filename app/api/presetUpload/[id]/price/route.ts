import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { trackPriceChange } from "@/utils/ecommerce/priceTracking";
import { z } from "zod";
import { stripe } from "@/lib/stripe";

const priceSchema = z.object({
  price: z.number().min(5, "Price must be at least $5").max(1000),
});

const priceUpdateSchema = z
  .object({
    price: z.number().min(5, "Price must be at least $5").max(1000).nullable(),
    priceType: z.enum(["FREE", "PREMIUM"]),
  })
  .refine(
    (data) => {
      if (data.priceType === "FREE" && data.price !== null) {
        return false;
      }
      if (data.priceType === "PREMIUM" && !data.price) {
        return false;
      }
      return true;
    },
    {
      message: "Price must be set for PREMIUM and null for FREE presets",
    }
  );

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
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
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
            price: validatedPrice,
          },
        });
        console.log(
          "[PricePATCH] Created preset price history:",
          presetPriceHistory
        );
      }

      // Update preset price
      const updatedPreset = await tx.presetUpload.update({
        where: { id: params.id },
        data: {
          price: validatedPrice,
          priceType: data.priceType,
        },
      });

      // Find and update cart items
      const cartItems = await tx.cartItem.findMany({
        where: { presetId: params.id },
        include: {
          priceHistory: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      });

      console.log(
        `[PricePATCH] Found ${cartItems.length} cart items to update`
      );

      // Create price history for each cart item
      for (const item of cartItems) {
        const lastCartItemPrice = item.priceHistory[0]?.price;
        if (
          !lastCartItemPrice ||
          Number(lastCartItemPrice) !== validatedPrice
        ) {
          const cartItemPriceHistory = await tx.priceHistory.create({
            data: {
              cartItemId: item.id,
              price: validatedPrice,
            },
          });
          console.log(
            `[PricePATCH] Created cart item price history:`,
            cartItemPriceHistory
          );
        }
      }

      if (currentPreset.stripeProductId) {
        await stripe.products.update(currentPreset.stripeProductId, {
          default_price_data: {
            currency: 'usd',
            unit_amount: Math.round(validatedPrice * 100),
          },
        });
      }

      return NextResponse.json({
        success: true,
        preset: updatedPreset,
        affectedCartItems: cartItems.length,
      });
    });
  } catch (error) {
    console.error("[PricePATCH] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update price",
      },
      { status: 500 }
    );
  }
}
