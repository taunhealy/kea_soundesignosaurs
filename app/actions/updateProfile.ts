"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  profileImage: z.string().url().optional(),
});

export async function updateProfile(formData: FormData) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    profileImage: formData.get("profileImage"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, email, profileImage } = parsed.data;

  try {
    await prisma.soundDesigner.update({
      where: { userId },
      data: { name, email, profileImage },
    });

    return { message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}
