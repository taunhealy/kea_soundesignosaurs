import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's email from Clerk
    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "No email address found" },
        { status: 400 }
      );
    }

    // Get cart items from the database
    const cart = await prisma.cart.findUnique({
      where: {
        userId_type: {
          userId,
          type: "CART",
        },
      },
      include: {
        items: {
          include: {
            preset: true,
            pack: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Format line items for Stripe
    const lineItems = cart.items.map((item) => {
      const product = item.preset || item.pack;
      if (!product) throw new Error("Invalid item in cart");

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
            description: product.description || undefined,
          },
          unit_amount: Math.round(Number(product.price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session with proper email
    const session = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0].emailAddress, // Use actual email instead of userId
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        userId,
        cartItems: JSON.stringify(
          cart.items.map((item) => ({
            id: item.preset?.id || item.pack?.id,
            type: item.preset ? 'PRESET' : 'PACK',
            price: item.preset?.price || item.pack?.price,
          }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
