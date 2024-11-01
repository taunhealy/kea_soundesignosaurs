"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetCard } from "@/app/components/PresetCard";
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
        <h1 className="text-3xl font-bold mb-4">{pack.title}</h1>

        <div className="mb-6">
          <PriceChangeDisplay
            currentPrice={pack.price}
            size="xl"
            itemType="pack"
          />
        </div>

        {pack.description && (
          <p className="text-lg text-muted-foreground mb-6">
            {pack.description}
          </p>
        )}

        <Button onClick={handleAddToCart} size="lg" className="mb-8">
          Add to Cart
        </Button>

        <h2 className="text-2xl font-semibold mb-4">Included Presets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(pack.presets) && pack.presets.map((item: any) => (
            <PresetCard key={item.preset.id} preset={item.preset} />
          ))}
        </div>
      </div>
    </div>
  );
}
