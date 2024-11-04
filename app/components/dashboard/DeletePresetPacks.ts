import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deletePresetPacks() {
  try {
    // Delete all PresetPackUpload entries
    await prisma.presetPackUpload.deleteMany();
    console.log("✅ All preset packs deleted");

    // Optionally, delete associated PresetUpload entries if needed
    await prisma.presetUpload.deleteMany();
    console.log("✅ All preset uploads deleted");
  } catch (error) {
    console.error("Error deleting preset packs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deletePresetPacks();
