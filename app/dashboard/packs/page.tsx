"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetPackCard } from "@/app/components/PresetPackCard";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

export default function PacksPage() {
  const { data: packs, isLoading } = useQuery({
    queryKey: ["presetPacks"],
    queryFn: async () => {
      const response = await fetch("/api/presetPacks/user");
      if (!response.ok) throw new Error("Failed to fetch packs");
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Preset Packs</h1>
        <Link href="/dashboard/packs/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Pack
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs?.map((pack: any) => (
          <PresetPackCard key={pack.id} pack={pack} isOwner={true} />
        ))}
      </div>
    </div>
  );
}
