import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ShootList from "@/app/components/ShootList";
import AddShootButton from "@/app/components/AddShootButton";

async function getShoots(userId: string) {
  const shoots = await prisma.shoot.findMany({
    where: { driver: { userId } },
    include: { vehicle: true },
  });

  // Convert the date property to a string
  return shoots.map(shoot => ({
    ...shoot,
    date: shoot.date.toISOString(), // Assuming date is a Date object
  }));
}

export default async function ShootsPage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const shoots = await getShoots(userId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Shoots</h1>
      <AddShootButton />
      <ShootList shoots={shoots} />
    </div>
  );
}
