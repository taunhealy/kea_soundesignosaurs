import { PrismaClient, PresetType } from "@prisma/client";
import { SystemGenres } from "../constants/constants";
import { faker } from "@faker-js/faker";
import prismaClient from "@/lib/prisma";

const prisma = prismaClient;

async function main() {
  try {
    // Clear existing data
    await prisma.packPresets.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.presetUpload.deleteMany();
    await prisma.genre.deleteMany();
    await prisma.vST.deleteMany();
    await prisma.soundDesigner.deleteMany();

    console.log("🧹 Cleaned up existing data");

    // Seed genres
    const genrePromises = Object.values(SystemGenres).map((genreName) =>
      prisma.genre.create({
        data: {
          name: genreName,
          type: genreName,
          isSystem: true,
        },
      })
    );

    const genres = await Promise.all(genrePromises);
    console.log("✅ Genres seeded");

    // Create VSTs
    await prisma.vST.createMany({
      data: [
        {
          id: "serum",
          name: "Serum",
          type: "SERUM",
        },
        {
          id: "vital",
          name: "Vital",
          type: "VITAL",
        },
      ],
      skipDuplicates: true,
    });

    // Fetch VSTs after creation
    const vsts = await prisma.vST.findMany();
    console.log("✅ VSTs seeded");

    // Create sound designers
    const soundDesigners = await Promise.all(
      Array(3)
        .fill(null)
        .map(() =>
          prisma.soundDesigner.create({
            data: {
              userId: faker.string.uuid(),
              name: faker.person.fullName(),
              username: faker.internet.userName(),
              email: faker.internet.email(),
              profileImage: faker.image.avatar(),
              websiteUrl: faker.internet.url(),
            },
          })
        )
    );
    console.log("✅ Sound designers seeded");

    // Create PresetUploads
    const presets = await Promise.all(
      Array(20) // Create 20 presets
        .fill(null)
        .map(() => {
          const randomGenre = genres[Math.floor(Math.random() * genres.length)];
          const randomVst = vsts[Math.floor(Math.random() * vsts.length)];
          const randomType =
            Object.values(PresetType)[
              Math.floor(Math.random() * Object.values(PresetType).length)
            ];
          const randomSoundDesigner =
            soundDesigners[Math.floor(Math.random() * soundDesigners.length)]; // Select a random sound designer
          return prisma.presetUpload.create({
            data: {
              title: faker.music.songName(),
              description: faker.lorem.paragraph(),
              presetType: randomType,
              priceType: faker.helpers.arrayElement(["FREE", "PREMIUM"]),
              userId: faker.string.uuid(), // Add missing userId field
              spotifyLink: faker.internet.url(),
              genreId: randomGenre.id,
              vstId: randomVst.id,
              tags: Array(3)
                .fill(null)
                .map(() => faker.music.genre()),
              guide: faker.lorem.paragraphs(2),
              soundDesignerId: randomSoundDesigner.id, // Assign the preset to the selected sound designer
            },
          });
        })
    );
    console.log("✅ Presets seeded");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
