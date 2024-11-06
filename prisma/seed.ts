import {
  PrismaClient,
  PresetType,
  PriceType,
  ContentType,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import { stripe } from "../lib/stripe";

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    await prisma.presetDownload.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.packPresets.deleteMany();
    await prisma.presetPackUpload.deleteMany();
    await prisma.presetUpload.deleteMany();
    console.log("✅ All preset data cleared");
  } catch (error) {
    console.error("Error clearing preset data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
