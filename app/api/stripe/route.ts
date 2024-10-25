import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();

  const signature = headers().get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_SECRET_WEBHOOK as string
    );
  } catch (error: unknown) {
    return new Response("Webhook Error", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      if (session.metadata?.userId) {
        await prisma.order.create({
          data: {
            amount: session.amount_total as number,
            status: session.status as string,
            userId: session.metadata.userId,
          },
        });
      } else {
        // Handle the case where userId is missing
        console.error('User ID is missing from session metadata');
        // You might want to throw an error or handle this case differently
      }

      await redis.del(`cart-${session.metadata?.userId}`);
      break;
    }
    default: {
      console.log("unhandled event");
    }
  }

  return new Response(null, { status: 200 });
}
