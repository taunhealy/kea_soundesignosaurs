"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Sample } from "@/types/SamplePresetTypes";

const sampleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  soundPreviewUrl: z.string().url(),
  downloadUrl: z.string().url(),
  genreId: z.string(),
});

export async function createSample(formData: FormData) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const validatedFields = sampleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    soundPreviewUrl: formData.get("soundPreviewUrl"),
    downloadUrl: formData.get("downloadUrl"),
    genreId: formData.get("genreId"),
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
    const createdSample = await prisma.sample.create({
      data: {
        ...validatedFields.data,
        soundDesignerId: soundDesigner.id,
      },
    });

    revalidatePath("/dashboard/samples");
    return { success: true };
  } catch (error) {
    console.error("Error creating sample:", error);
    return { error: "Failed to create sample" };
  }
}

export async function updateSample(sampleId: string, formData: FormData) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const validatedFields = sampleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    soundPreviewUrl: formData.get("soundPreviewUrl"),
    downloadUrl: formData.get("downloadUrl"),
    genreId: formData.get("genreId"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  try {
    const updatedSample = await prisma.sample.update({
      where: { id: sampleId },
      data: validatedFields.data,
    });

    revalidatePath("/dashboard/samples");
    return { success: true };
  } catch (error) {
    console.error("Error updating sample:", error);
    return { error: "Failed to update sample" };
  }
}

export async function deleteSample(sampleId: string) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  try {
    await prisma.sample.delete({
      where: { id: sampleId },
    });

    revalidatePath("/dashboard/samples");
    return { success: true };
  } catch (error) {
    console.error("Error deleting sample:", error);
    return { error: "Failed to delete sample" };
  }
}

export async function getSample(sampleId: string) {
  try {
    const sample = await prisma.sample.findUnique({
      where: { id: sampleId },
      include: {
        genre: true,
        soundDesigner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!sample) {
      return { error: "Sample not found" };
    }

    return { success: true, sample };
  } catch (error) {
    return { error: "Failed to fetch sample" };
  }
}

export async function getSamples(page = 1, limit = 10, genreId?: string) {
  const skip = (page - 1) * limit;

  try {
    const where = genreId ? { genreId } : {};

    const [samples, totalCount] = await Promise.all([
      prisma.sample.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          genre: true,
          soundDesigner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.sample.count({
        where,
      }),
    ]);

    return { success: true, samples, totalCount };
  } catch (error) {
    return { error: "Failed to fetch samples" };
  }
}
