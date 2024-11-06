import { useAppDispatch } from "@/app/store/hooks";
import { addToWishlist as addToWishlistAction } from "@/app/store/features/cartSlice";

export function useWishlist() {
  const dispatch = useAppDispatch();

  const mutateAsync = async ({
    itemId,
    itemType,
  }: {
    itemId: string;
    itemType: "PRESET" | "PACK";
  }) => {
    return dispatch(addToWishlistAction({ itemId, itemType })).unwrap();
  };

  return { mutateAsync };
}
