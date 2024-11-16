import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // First, clean the database
  console.log("Cleaning database...");
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.presetDownload.deleteMany({});
  await prisma.presetPackDownload.deleteMany({});
  await prisma.presetUpload.deleteMany({});
  await prisma.presetRequest.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleaned");

  console.log("Seed data added");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
