import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sessionId = searchParams.session_id;
  if (!sessionId) redirect("/");

  try {
    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      redirect("/cart?error=payment-failed");
    }

    // Clear the user's cart
    await prisma.cart.update({
      where: {
        userId_type: {
          userId: user.id,
          type: "CART",
        },
      },
      data: {
        items: {
          deleteMany: {},
        },
      },
    });

    // Redirect to downloads page
    redirect("/dashboard/downloads");
  } catch (error) {
    console.error("Error processing success page:", error);
    redirect("/cart?error=verification-failed");
  }
}
