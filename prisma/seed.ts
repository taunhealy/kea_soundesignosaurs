const { PrismaClient } = require("@prisma/client");
import { Genre } from "../app/types/enums";

const prisma = new PrismaClient();

async function main() {
  // Create genres from enum
  for (const [key, value] of Object.entries(Genre)) {
    await prisma.genre.upsert({
      where: { name: value },
      update: {},
      create: {
        name: value,
        type: key as any, // Cast to GenreType enum
        isCustom: false,
      },
    });
  }

  console.log("Database has been seeded with test data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Add explicit export to mark as ES module
export {};
