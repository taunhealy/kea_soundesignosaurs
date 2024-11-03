import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import CheckoutStatus from "@/app/components/CheckoutStatus";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  const user = await currentUser();
  if (!user) {
    return (
      <CheckoutStatus
        status="error"
        message="Please sign in to complete your purchase"
        redirect="/sign-in"
      />
    );
  }

  const sessionId = searchParams.session_id;
  if (!sessionId) {
    return (
      <CheckoutStatus
        status="error"
        message="Your session has expired. Please try again."
        redirect="/cart"
      />
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return (
        <CheckoutStatus
          status="error"
          message="Your payment was not completed. Please try again."
          redirect="/cart"
        />
      );
    }

    const cartItems = JSON.parse(session.metadata?.cartItems || "[]");
    if (!cartItems.length) {
      return (
        <CheckoutStatus
          status="error"
          message="No items found in your order. Please try again."
          redirect="/cart"
        />
      );
    }

    try {
      // Database operations...
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

      await Promise.all(
        cartItems.map((item: { id: string; type: string }) =>
          prisma.download.create({
            data: {
              userId: user.id,
              ...(item.type === "PRESET"
                ? { presetId: item.id }
                : { packId: item.id }),
            },
          })
        )
      );

      // On success:
      return (
        <CheckoutStatus
          status="success"
          message="Thank you for your purchase!"
          redirect={
            cartItems.some((item: { type: string }) => item.type === "PACK") &&
            !cartItems.some((item: { type: string }) => item.type === "PRESET")
              ? "/dashboard/packs?tab=downloaded"
              : "/dashboard/presets?tab=downloaded"
          }
        />
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return (
        <CheckoutStatus
          status="error"
          message="We're processing your order. Please check your downloads in a few minutes."
          redirect="/dashboard"
        />
      );
    }
  } catch (error) {
    console.error("Error processing success page:", error);
    return (
      <CheckoutStatus
        status="error"
        message="We're verifying your purchase. Please check your downloads in a few minutes."
        redirect="/dashboard"
      />
    );
  }
}
