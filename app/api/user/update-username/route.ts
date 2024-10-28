import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { username } = await request.json();

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Invalid username format" },
        { status: 400 }
      );
    }

    try {
      const clerk = await clerkClient();

      // First, get the current user to check their username
      const user = await clerk.users.getUser(userId);

      // If the user already has a username, first remove it
      if (user.username) {
        await clerk.users.updateUser(userId, {
          username: undefined,
        });
      }

      // Then set the new username
      await clerk.users.updateUser(userId, {
        username: username,
      });

      // Update in your database
      await prisma.soundDesigner.update({
        where: { userId },
        data: { username },
      });
    } catch (clerkError: any) {
      console.error("Clerk error:", clerkError);
      return NextResponse.json(
        {
          message: clerkError.errors?.[0]?.message || "Username update failed",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ message: "Username updated successfully" });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
