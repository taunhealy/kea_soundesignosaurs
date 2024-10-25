"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import {
  bannerSchema,
  productSchema,
  photographerProfileSchema,
} from "../lib/zodSchemas";
import prisma from "../lib/prisma";
import { redis } from "../lib/redis";
import { Cart } from "../lib/interfaces";
import { revalidatePath } from "next/cache";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";
import { z } from "zod";

export async function createProduct(prevState: unknown, formData: FormData) {
  const { userId } = auth();

  console.log("Creating product, userId:", userId);

  if (!userId || userId !== "user_2nby04NPmo74hKnRVc27bBMb2Qn") {
    console.error("Unauthorized access attempt:", { userId });
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const flattenUrls = submission.value.images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );

  try {
    const createdProduct = await prisma.product.create({
      data: {
        name: submission.value.name,
        description: submission.value.description,
        status: submission.value.status,
        price: submission.value.price,
        images: flattenUrls,
        category: submission.value.category,
        isFeatured: submission.value.isFeatured === true ? true : false,
      },
    });
    console.log("Product created successfully:", createdProduct);
    revalidatePath("/dashboard/products");
    return redirect("/dashboard/products");
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof Error) {
      return { error: "Failed to create product", details: error.message };
    }
    return {
      error: "Failed to create product",
      details: "An unknown error occurred",
    };
  }
}

export async function editProduct(prevState: any, formData: FormData) {
  const { userId } = auth();

  if (!userId || userId !== "cb5044a2-24c8-4332-98fd-c5b108d10692") {
    console.error("Unauthorized access attempt:", { userId });
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const flattenUrls = submission.value.images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );

  const productId = formData.get("productId") as string;
  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      name: submission.value.name,
      description: submission.value.description,
      category: submission.value.category,
      price: submission.value.price,
      isFeatured: submission.value.isFeatured === true ? true : false,
      status: submission.value.status,
      images: flattenUrls,
    },
  });

  redirect("/dashboard/products");
}

export async function deleteProduct(formData: FormData) {
  const { userId } = auth();

  if (!userId || userId !== "cb5044a2-24c8-4332-98fd-c5b108d10692") {
    return redirect("/");
  }

  await prisma.product.delete({
    where: {
      id: formData.get("productId") as string,
    },
  });

  redirect("/dashboard/products");
}

export async function createBanner(prevState: any, formData: FormData) {
  const { userId } = auth();

  if (!userId || userId !== "cb5044a2-24c8-4332-98fd-c5b108d10692") {
    console.error("Unauthorized access attempt:", { userId });
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: bannerSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.banner.create({
    data: {
      title: submission.value.title,
      imageString: submission.value.imageString,
    },
  });

  redirect("/dashboard/banner");
}

export async function deleteBanner(formData: FormData) {
  const { userId } = auth();

  if (!userId || userId !== "cb5044a2-24c8-4332-98fd-c5b108d10692") {
    return redirect("/");
  }

  await prisma.banner.delete({
    where: {
      id: formData.get("bannerId") as string,
    },
  });

  redirect("/dashboard/banner");
}

export async function addItem(productId: string) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  let cart: Cart | null = await redis.get(`cart-${userId}`);

  const selectedProduct = await prisma.product.findUnique({
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
    },
    where: {
      id: productId,
    },
  });

  if (!selectedProduct) {
    throw new Error("No product with this id");
  }
  let myCart = {} as Cart;

  if (!cart || !cart.items) {
    myCart = {
      userId: userId,
      items: [
        {
          price: selectedProduct.price,
          id: selectedProduct.id,
          imageString: selectedProduct.images[0],
          name: selectedProduct.name,
          quantity: 1,
        },
      ],
    };
  } else {
    let itemFound = false;

    myCart.items = cart.items.map((item) => {
      if (item.id === productId) {
        itemFound = true;
        item.quantity += 1;
      }

      return item;
    });

    if (!itemFound) {
      myCart.items.push({
        id: selectedProduct.id,
        imageString: selectedProduct.images[0],
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
      });
    }
  }

  await redis.set(`cart-${userId}`, myCart);

  revalidatePath("/", "layout");
}

export async function delItem(formData: FormData) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const productId = formData.get("productId");

  let cart: Cart | null = await redis.get(`cart-${userId}`);

  if (cart && cart.items) {
    const updateCart: Cart = {
      userId: userId,
      items: cart.items.filter((item) => item.id !== productId),
    };

    await redis.set(`cart-${userId}`, updateCart);
  }

  revalidatePath("/bag");
}

export async function checkOut() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  let cart: Cart | null = await redis.get(`cart-${userId}`);

  if (cart && cart.items) {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cart.items.map((item) => ({
        price_data: {
          currency: "usd",
          unit_amount: item.price * 100,
          product_data: {
            name: item.name,
            images: [item.imageString],
          },
        },
        quantity: item.quantity,
      }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/payment/success"
          : "https://shoe-marshal.vercel.app/payment/success",
      cancel_url:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/payment/cancel"
          : "https://shoe-marshal.vercel.app/payment/cancel",
      metadata: {
        userId: userId,
      },
    });

    return redirect(session.url as string);
  }
}

export async function updatePhotographerProfile(formData: FormData) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: photographerProfileSchema.extend({
      profileImage: z.string().optional(),
    }),
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const existingPhotographer = await prisma.photographer.findUnique({
      where: { userId },
    });

    const data = {
      name: submission.value.name,
      email: submission.value.email,
      location: submission.value.location,
      priceRange: submission.value.priceRange,
      profileImage: submission.value.profileImage,
    };

    if (existingPhotographer) {
      await prisma.photographer.update({
        where: { userId },
        data,
      });
    } else {
      await prisma.photographer.create({
        data: {
          userId,
          ...data,
        },
      });
    }

    revalidatePath("/dashboard/profile");
    return { message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}
