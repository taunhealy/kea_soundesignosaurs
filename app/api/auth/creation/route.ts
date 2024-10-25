import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  noStore();
  const { userId } = auth();

  if (!userId) {
    throw new Error("Something went wrong...");
  }

  let dbUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!dbUser) {
    const user = await clerkClient.users.getUser(userId);
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.emailAddresses[0]?.emailAddress ?? "",
        profileImage: user.imageUrl,
      },
    });
  }

  return NextResponse.redirect(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/"
      : "https://shoe-marshal.vercel.app/"
  );
}
