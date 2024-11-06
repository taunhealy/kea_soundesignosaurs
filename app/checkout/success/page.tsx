import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import CheckoutStatus from "@/app/components/CheckoutStatus";
import { auth } from "@clerk/nextjs/server";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  const { userId } = await auth();
  if (!userId || !searchParams.session_id) {
    redirect("/");
  }

  const session = await stripe.checkout.sessions.retrieve(
    searchParams.session_id,
    {
      expand: ["line_items", "line_items.data.price.product"],
    }
  );

  if (!session.metadata?.cartId) {
    throw new Error("No cart ID found in session metadata");
  }

  const cartItems = await prisma.cartItem.findMany({
    where: {
      cartId: session.metadata.cartId,
    },
    include: {
      preset: true,
      pack: true,
    },
  });

  const downloads = await Promise.all(
    cartItems.map(async (item) => {
      if (item.itemType === "PRESET" && item.presetId) {
        return prisma.presetDownload.create({
          data: {
            userId,
            presetId: item.presetId,
          },
        });
      } else if (item.itemType === "PACK" && item.packId) {
        return prisma.presetPackDownload.create({
          data: {
            userId,
            packId: item.packId,
          },
        });
      }
      return null;
    })
  );

  const successfulDownloads = downloads.filter(Boolean);
  console.log(`Created ${successfulDownloads.length} download records`);

  if (successfulDownloads.length === 0) {
    throw new Error("Failed to create any download records");
  }

  // Delete cart items after successful download records creation
  await prisma.cartItem.deleteMany({
    where: {
      cartId: session.metadata.cartId,
    },
  });

  // Delete the cart itself
  await prisma.cart.delete({
    where: {
      id: session.metadata.cartId,
    },
  });

  // Redirect to downloads page
  redirect("/dashboard/presets?type=downloaded");
}
