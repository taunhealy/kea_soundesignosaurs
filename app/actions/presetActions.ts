"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const priceSchema = z.number().min(0).max(1000);

export async function updatePresetPrice(presetId: string, newPrice: number) {
  console.log(`Attempting to update preset ${presetId} price to ${newPrice}`);
  
  try {
    const response = await fetch(`/api/presetUpload/${presetId}/price`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ price: newPrice }),
    });

    const data = await response.json();
    console.log('Price update response:', data);

    if (!response.ok) {
      throw new Error(data.error || "Failed to update price");
    }

    return { success: true, priceChanges: data.priceChanges };
  } catch (error) {
    console.error("Error updating preset price:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to update price",
    };
  }
}
