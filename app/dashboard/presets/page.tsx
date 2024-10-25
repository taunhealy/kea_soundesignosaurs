import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PresetCard } from "@/app/components/PresetCard";
import { SearchSidebar } from "@/app/components/SearchSidebar";

async function getPresets(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { downloadedPresets: true },
  });
  return user?.downloadedPresets || [];
}

export default async function PresetsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const presets = await getPresets(userId);

  return (
    <div className="flex">
      <SearchSidebar />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">My Presets</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <PresetCard key={preset.id} preset={preset} />
          ))}
        </div>
      </div>
    </div>
  );
}
