import { Button } from "@/app/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/app/hooks/useCart";
import { useWishlist } from "@/app/hooks/useWishlist";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ItemActionButtonsProps {
  itemId: string;
  itemType: "preset" | "pack";
  price?: number | null;
  className?: string;
  showDownloadOnly?: boolean;
}

export function ItemActionButtons({
  itemId,
  itemType,
  price,
  className,
}: ItemActionButtonsProps) {
  const { addToCart } = useCart();
  const { mutateAsync: addToWishlist } = useWishlist();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(itemId, itemType.toUpperCase() as "PRESET" | "PACK");
      toast.success(`${itemType} added to cart`);
    } catch (error) {
      toast.error(`Failed to add ${itemType} to cart`);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToWishlist({
        itemId,
        itemType: itemType.toUpperCase() as "PRESET" | "PACK",
      });
      toast.success(`${itemType} added to wishlist`);
    } catch (error) {
      toast.error(`Failed to add ${itemType} to wishlist`);
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        onClick={handleAddToCart}
        variant="secondary"
        size="icon"
        className="h-8 w-8"
        title="Add to Cart"
      >
        <ShoppingCart className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleAddToWishlist}
        variant="secondary"
        size="icon"
        className="h-8 w-8"
        title="Add to Wishlist"
      >
        <Heart className="h-4 w-4" />
      </Button>
    </div>
  );
}
