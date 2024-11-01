import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    try {
      const userId = session.metadata.userId;
      const cartItems = JSON.parse(session.metadata.cartItems);

      // Create order record
      const order = await prisma.order.create({
        data: {
          userId: userId,
          amount: session.amount_total,
          status: "completed",
        },
      });

      // Create order items and downloads
      await Promise.all(
        cartItems.map(async (item: { id: string; price: number }) => {
          // Create order item
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              presetId: item.id,
              price: item.price,
              quantity: 1,
            },
          });

          // Create download record
          await prisma.download.create({
            data: {
              userId: userId,
              presetId: item.id,
            },
          });
        })
      );

      // Clear the cart
      await redis.del(`cart-${userId}`);
    } catch (error) {
      console.error("Error processing successful payment:", error);
      return new NextResponse("Error processing payment", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
