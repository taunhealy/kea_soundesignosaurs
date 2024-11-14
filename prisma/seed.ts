import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users first
  const user1 = await prisma.user.upsert({
    where: { email: 'tester1@example.com' },
    update: {},
    create: {
      id: 'test-user-1',
      email: 'tester1@example.com',
      username: 'tester1',
      name: 'Test User 1',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'tester2@example.com' },
    update: {},
    create: {
      id: 'test-user-2',
      email: 'tester2@example.com',
      username: 'tester2',
      name: 'Test User 2',
    },
  })

  // Create a test genre
  const genre = await prisma.genre.upsert({
    where: { name: 'House' },
    update: {},
    create: {
      name: 'House',
      type: 'ELECTRONIC',
    },
  })

  // Create preset requests
  await prisma.presetRequest.createMany({
    data: [
      {
        title: "Looking for a deep house pluck",
        youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        enquiryDetails: "Need a pluck sound similar to the one at 1:24",
        status: "OPEN",
        userId: user1.id,
        genreId: genre.id,
      },
      {
        title: "Seeking future bass lead",
        youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        enquiryDetails: "Looking for that signature future bass lead sound",
        status: "OPEN",
        userId: user2.id,
        genreId: genre.id,
      },
      {
        title: "Need techno bass preset",
        youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        enquiryDetails: "Looking for a rumbling techno bass preset",
        status: "OPEN",
        userId: user1.id,
        genreId: genre.id,
      },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
