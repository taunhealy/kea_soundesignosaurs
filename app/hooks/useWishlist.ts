import { useAppDispatch } from "@/app/store/hooks";
import { addToCart } from "@/app/store/features/cartSlice";

export function useWishlist() {
  const dispatch = useAppDispatch();

  const mutateAsync = async ({
    itemId,
    itemType,
  }: {
    itemId: string;
    itemType: "PRESET" | "PACK";
  }) => {
    return dispatch(addToCart({ itemId, type: "wishlist", itemType })).unwrap();
  };

  return { mutateAsync };
}
