import { useAppSelector } from "@/app/store/hooks";
import {
  selectCartItems,
  selectWishlistItems,
} from "@/app/store/features/cartSlice";
import { ShoppingCartIcon, HeartIcon } from "lucide-react";
import Link from "next/link";

export function CartIndicator() {
  const cartItems = useAppSelector(selectCartItems);
  const wishlistItems = useAppSelector(selectWishlistItems);

  return (
    <div className="flex items-center gap-4">
      <Link href="/wishlist" className="relative">
        <HeartIcon className="h-6 w-6" />
        {wishlistItems.length > 0 && (
          <span className="absolute -top-2 -right-2 text-xs">
            {wishlistItems.length}
          </span>
        )}
      </Link>
      <Link href="/cart" className="relative">
        <ShoppingCartIcon className="h-6 w-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {cartItems.length}
          </span>
        )}
      </Link>
    </div>
  );
}
