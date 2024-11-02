import { PrismaClient, PresetType } from '@prisma/client';
import { SystemGenres } from '../constants/constants';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    await prisma.packPresets.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.download.deleteMany();
    await prisma.presetUpload.deleteMany();
    await prisma.presetPack.deleteMany();
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
    const vsts = await Promise.all([
      prisma.vST.create({ data: { name: "Serum" } }),
      prisma.vST.create({ data: { name: "Vital" } }),
      prisma.vST.create({ data: { name: "Polygrid" } }),
    ]);
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

    // Create presets
    const presetTypes = Object.values(PresetType);
    const presets = await Promise.all(
      Array(20)
        .fill(null)
        .map(() => {
          const randomGenre = genres[Math.floor(Math.random() * genres.length)];
          const randomVst = vsts[Math.floor(Math.random() * vsts.length)];
          const randomDesigner =
            soundDesigners[Math.floor(Math.random() * soundDesigners.length)];
          const randomType =
            presetTypes[Math.floor(Math.random() * presetTypes.length)];

          return prisma.presetUpload.create({
            data: {
              title: faker.music.songName(),
              description: faker.lorem.paragraph(),
              presetType: randomType,
              price: parseFloat(faker.commerce.price({ min: 5, max: 50 })),
              spotifyLink: faker.internet.url(),
              genreId: randomGenre.id,
              vstId: randomVst.id,
              soundDesignerId: randomDesigner.id,
              tags: Array(3)
                .fill(null)
                .map(() => faker.music.genre()),
              guide: faker.lorem.paragraphs(2),
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
