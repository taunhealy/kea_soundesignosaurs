"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetPackCard } from "@/app/components/PresetPackCard";
import { Button } from "@/app/components/ui/button";
import { PriceChangeDisplay } from "@/app/components/PriceChangeDisplay";
import { useCart } from "@/app/hooks/useCart";
import { toast } from "react-hot-toast";

export default function PackPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();

  const { data: pack, isLoading } = useQuery({
    queryKey: ["presetPack", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/presetPacks/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch pack");
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!pack) return <div>Pack not found</div>;
  if (!pack.presets) return <div>Invalid pack data</div>;

  const handleAddToCart = async () => {
    try {
      await addToCart(pack.id);
      toast.success("Pack added to cart");
    } catch (error) {
      toast.error("Failed to add pack to cart");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PresetPackCard pack={pack} />
      </div>
    </div>
  );
}
