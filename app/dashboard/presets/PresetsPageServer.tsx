import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PresetsPageClient from "./PresetsPageClient";

async function getDownloadedPresets(userId: string) {
  const downloads = await prisma.download.findMany({
    where: {
      userId: userId,
      presetId: { not: null },
    },
    include: { preset: true },
  });
  return downloads.map((download) => download.preset);
}

async function getUploadedPresets(userId: string) {
  const soundDesigner = await prisma.soundDesigner.findUnique({
    where: { userId },
    include: { presets: true },
  });
  return soundDesigner?.presets || [];
}

export default async function PresetsPageServer() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const downloadedPresets = await getDownloadedPresets(userId);
  const uploadedPresets = await getUploadedPresets(userId);

  return <PresetsPageClient downloadedPresets={downloadedPresets} uploadedPresets={uploadedPresets} />;
}

