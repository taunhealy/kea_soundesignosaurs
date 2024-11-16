import { useAppDispatch } from "@/app/store/hooks";
import {
  addToCart as addToCartAction,
  optimisticAddToCart,
  fetchCartItems,
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

      // Create a temporary item for optimistic update
      const tempItem = {
        id: itemId,
        itemType,
        quantity: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cartId: 'temp',
        presetId: itemType === 'PRESET' ? itemId : null,
        packId: itemType === 'PACK' ? itemId : null,
      };

      // Dispatch optimistic update
      dispatch(
        optimisticAddToCart({
          itemId,
          type: CartType.WISHLIST,
          item: tempItem
        })
      );

      // Make the actual API call
      const result = await dispatch(
        addToCartAction({
          itemId,
          cartType: CartType.WISHLIST,
          itemType,
        })
      ).unwrap();

      // Refresh the actual state
      await dispatch(fetchCartItems(CartType.WISHLIST));
      
      toast.success("Added to wishlist");
      return result;

    } catch (error) {
      // Revert optimistic update by fetching current state
      await dispatch(fetchCartItems(CartType.WISHLIST));
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add to wishlist");
      }
      throw error;
    }
  };

  return {
    addToWishlist,
  };
}
