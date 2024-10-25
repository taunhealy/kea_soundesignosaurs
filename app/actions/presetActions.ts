"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const presetSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  fxGuide: z.string().min(1),
  spotifyLink: z.string().url().optional(),
  soundPreviewUrl: z.string().url(),
  downloadUrl: z.string().url(),
  genreId: z.string(),
  vstId: z.string(),
});

export async function createPreset(formData: FormData) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const validatedFields = presetSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    fxGuide: formData.get("fxGuide"),
    spotifyLink: formData.get("spotifyLink"),
    soundPreviewUrl: formData.get("soundPreviewUrl"),
    downloadUrl: formData.get("downloadUrl"),
    genreId: formData.get("genreId"),
    vstId: formData.get("vstId"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const soundDesigner = await prisma.soundDesigner.findUnique({
    where: { userId },
  });

  if (!soundDesigner) {
    return { error: "Sound designer not found" };
  }

  try {
    const createdPreset = await prisma.preset.create({
      data: {
        ...validatedFields.data,
        soundDesignerId: soundDesigner.id,
      },
    });

    revalidatePath("/dashboard/presets");
    return { success: true };
  } catch (error) {
    console.error("Error creating preset:", error);
    return { error: "Failed to create preset" };
  }
}

export async function updatePreset(presetId: string, formData: FormData) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const validatedFields = presetSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    fxGuide: formData.get("fxGuide"),
    spotifyLink: formData.get("spotifyLink"),
    soundPreviewUrl: formData.get("soundPreviewUrl"),
    downloadUrl: formData.get("downloadUrl"),
    genreId: formData.get("genreId"),
    vstId: formData.get("vstId"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  try {
    const updatedPreset = await prisma.preset.update({
      where: { id: presetId },
      data: validatedFields.data,
    });

    revalidatePath("/dashboard/presets");
    return { success: true };
  } catch (error) {
    console.error("Error updating preset:", error);
    return { error: "Failed to update preset" };
  }
}

export async function deletePreset(presetId: string) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  try {
    await prisma.preset.delete({
      where: { id: presetId },
    });

    revalidatePath("/dashboard/presets");
    return { success: true };
  } catch (error) {
    console.error("Error deleting preset:", error);
    return { error: "Failed to delete preset" };
  }
}
