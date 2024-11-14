import { PrismaClient, VstType } from "@prisma/client";

const prisma = new PrismaClient();

async function seedVSTs() {
  try {
    console.log("Starting to seed VSTs...");

    // First, delete all existing VSTs
    await prisma.vST.deleteMany();
    console.log("Cleared existing VSTs");

    // Create VSTs with unique IDs and names
    const vsts = [
      {
        id: "serum-vst",
        name: "Serum",
        type: VstType.SERUM,
      },
      {
        id: "vital-vst",
        name: "Vital",
        type: VstType.VITAL,
      },
    ];

    // Create VSTs one by one
    for (const vst of vsts) {
      await prisma.vST.create({
        data: vst,
      });
      console.log(`Created VST: ${vst.name}`);
    }

    console.log("✅ VSTs seeded successfully");
  } catch (error) {
    console.error("Error seeding VSTs:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedVSTs()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
