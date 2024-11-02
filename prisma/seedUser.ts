import { PrismaClient, PresetType } from "@prisma/client";
import { SystemGenres } from "../constants/constants";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Replace this with your Clerk user ID
const YOUR_CLERK_USER_ID = "user_2o273MutOJtstomrgIHl3q1pex6";

async function main() {
  try {
    // First, ensure you have a SoundDesigner profile
    let soundDesigner = await prisma.soundDesigner.findUnique({
      where: { userId: YOUR_CLERK_USER_ID },
    });

    if (!soundDesigner) {
      soundDesigner = await prisma.soundDesigner.create({
        data: {
          userId: YOUR_CLERK_USER_ID,
          name: faker.person.fullName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          profileImage: faker.image.avatar(),
          websiteUrl: faker.internet.url(),
        },
      });
    }

    console.log("✅ Sound designer profile ready");

    // Ensure we have genres
    const genres = await prisma.genre.findMany();
    if (genres.length === 0) {
      await Promise.all(
        Object.values(SystemGenres).map((genreName) =>
          prisma.genre.create({
            data: {
              name: genreName,
              type: genreName,
              isSystem: true,
            },
          })
        )
      );
    }

    // Ensure we have VSTs
    const vsts = await prisma.vST.findMany();
    if (vsts.length === 0) {
      await Promise.all([
        prisma.vST.create({ data: { name: "Serum" } }),
        prisma.vST.create({ data: { name: "Vital" } }),
        prisma.vST.create({ data: { name: "Polygrid" } }),
      ]);
    }

    // Create presets for your user
    const presetTypes = Object.values(PresetType);
    const presets = await Promise.all(
      Array(10)
        .fill(null)
        .map(async () => {
          const randomGenre = genres[Math.floor(Math.random() * genres.length)];
          const randomVst = vsts[Math.floor(Math.random() * vsts.length)];
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
              soundDesignerId: soundDesigner.id,
              tags: Array(3)
                .fill(null)
                .map(() => faker.music.genre()),
              guide: faker.lorem.paragraphs(2),
              soundPreviewUrl: `https://example.com/previews/${faker.string.uuid()}.mp3`,
              presetFileUrl: `https://example.com/presets/${faker.string.uuid()}.fxp`,
              originalFileName: `${faker.music.songName()}.fxp`,
              quantity: faker.number.int({ min: 1, max: 100 }),
            },
          });
        })
    );

    console.log(`✅ Created ${presets.length} presets for your account`);
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
