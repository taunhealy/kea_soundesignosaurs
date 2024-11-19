import { PrismaClient, PresetType, PriceType, VstType } from "@prisma/client";
import { hash } from "bcrypt";

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
  await prisma.vST.deleteMany({});
  await prisma.genre.deleteMany({});

  console.log("Database cleaned");

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "taunhealy@gmail.com",
      name: "Taun Healy",
      username: "taunhealy",
      image: "https://avatars.githubusercontent.com/u/12345678",
    },
  });

  // Create some regular users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "producer1@example.com",
        name: "John Producer",
        username: "johnpro",
      },
    }),
    prisma.user.create({
      data: {
        email: "producer2@example.com",
        name: "Sarah Sound",
        username: "sarahsound",
      },
    }),
  ]);

  // Create VSTs
  const vsts = await Promise.all([
    prisma.vST.create({
      data: {
        name: "Serum",
        type: VstType.SERUM,
      },
    }),
    prisma.vST.create({
      data: {
        name: "Vital",
        type: VstType.VITAL,
      },
    }),
  ]);

  // Create Genres
  const genres = await Promise.all([
    prisma.genre.create({
      data: {
        name: "Future Bass",
        type: "SYSTEM",
      },
    }),
    prisma.genre.create({
      data: {
        name: "Hardwave",
        type: "SYSTEM",
      },
    }),
    prisma.genre.create({
      data: {
        name: "Wave",
        type: "SYSTEM",
      },
    }),
  ]);

  // Create Presets
  const presets = await Promise.all([
    // Admin user presets
    prisma.presetUpload.create({
      data: {
        userId: adminUser.id,
        title: "Epic Future Bass Lead",
        description: "A powerful, wide future bass lead with lots of movement",
        presetType: PresetType.LEAD,
        priceType: PriceType.PREMIUM,
        price: 4.99,
        vstId: vsts[0].id, // Serum
        genreId: genres[0].id, // Future Bass
        tags: ["future bass", "lead", "wide"],
      },
    }),
    // Regular user presets
    prisma.presetUpload.create({
      data: {
        userId: users[0].id,
        title: "Dark Wave Pad",
        description: "Atmospheric pad perfect for wave music",
        presetType: PresetType.PAD,
        priceType: PriceType.FREE,
        price: 0,
        vstId: vsts[1].id, // Vital
        genreId: genres[2].id, // Wave
        tags: ["wave", "pad", "atmospheric"],
      },
    }),
    prisma.presetUpload.create({
      data: {
        userId: users[1].id,
        title: "Hardwave Bass",
        description: "Heavy distorted bass for hardwave tracks",
        presetType: PresetType.BASS,
        priceType: PriceType.PREMIUM,
        price: 3.99,
        vstId: vsts[0].id, // Serum
        genreId: genres[1].id, // Hardwave
        tags: ["hardwave", "bass", "distorted"],
      },
    }),
  ]);

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
