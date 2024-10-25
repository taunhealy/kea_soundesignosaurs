import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileForm from "@/app/components/dashboard/ProfileForm";

async function getPhotographerProfile(userId: string) {
  const profile = await prisma.photographer.findUnique({
    where: { userId },
    include: { packages: true },
  });
  return profile;
}

export default async function ProfilePage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const profile = await getPhotographerProfile(userId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Photographer Profile</h1>
      <ProfileForm initialData={profile} userId={userId} />
    </div>
  );
}
