import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { authOptions } from "@/lib/auth";

export async function GET() {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "No email provided" }, { status: 401 });
  }

  // Create or get User record
  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    // Generate a unique username based on email
    const baseUsername = session.user.email.split('@')[0];
    let username = baseUsername;
    let count = 1;
    
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${count}`;
      count++;
    }

    user = await prisma.user.create({
      data: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || "Anonymous",
        username: session.user.name || baseUsername || "Anonymous",
        image: session.user.image || null,
      },
    });
  } else if (user.id !== session.user.id) {
    // Update the user's ID to match the OAuth provider's ID if different
    user = await prisma.user.update({
      where: { email: session.user.email },
      data: { id: session.user.id },
    });
  }

  return NextResponse.redirect(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/"
      : "https://your-production-url.com/"
  );
}
