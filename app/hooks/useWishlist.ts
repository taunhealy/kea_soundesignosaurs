import { useAppDispatch } from "@/app/store/hooks";
import {
  addToCart as addToCartAction,
  optimisticAddToCart,
} from "@/app/store/features/cartSlice";
import { CartType } from "@prisma/client";
import { toast } from "react-hot-toast";

export function useWishlist() {
  const dispatch = useAppDispatch();

  const addToWishlist = async (
    itemId: string,
    itemType: "PRESET" | "PACK" = "PRESET"
  ) => {
    try {
      console.log("Adding to wishlist:", { itemId, itemType });

      // Optimistic update
      dispatch(
        optimisticAddToCart({
          itemId,
          type: CartType.WISHLIST,
          item: {
            id: itemId,
            itemType: itemType,
            quantity: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            cartId: '',
            presetId: itemType === 'PRESET' ? itemId : null,
            packId: itemType === 'PACK' ? itemId : null,
          }
        })
      );

      // Actual API call
      const result = await dispatch(
        addToCartAction({
          itemId,
          cartType: CartType.WISHLIST,
          itemType,
        })
      ).unwrap();

      console.log("Add to wishlist result:", result);
      return result;
    } catch (error) {
      console.error("Add to wishlist error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add to wishlist");
      }
      throw error;
    }
  };

  return {
    addToWishlist, // Changed from mutateAsync to addToWishlist for clarity
  };
}
