import { useAppDispatch } from "../store/hooks";
import { addToCart as addToCartAction } from "@/app/store/features/cartSlice";
import { CartType } from "@prisma/client";
import { toast } from "react-hot-toast";

export function useCart() {
  const dispatch = useAppDispatch();

  const addToCart = async (
    itemId: string,
    itemType: "PRESET" | "PACK" = "PRESET"
  ) => {
    try {
      console.log("Adding to cart:", { itemId, itemType });
      const result = await dispatch(
        addToCartAction({
          itemId,
          type: "CART" as CartType,
          itemType,
        })
      ).unwrap();
      console.log("Add to cart result:", result);
      return result;
    } catch (error) {
      console.error("Add to cart error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add to cart");
      }
      throw error;
    }
  };

  return {
    addToCart,
  };
}
