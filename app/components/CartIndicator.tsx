"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import {
  selectCartItems,
  selectWishlistItems,
  fetchCartItems,
} from "@/app/store/features/cartSlice";
import { ShoppingCartIcon, HeartIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";

export function CartIndicator() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const { session, status } = useAuthRedirect();

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch all cart types on mount
      dispatch(fetchCartItems("cart"));
      dispatch(fetchCartItems("wishlist"));
    }
  }, [dispatch, status]);

  if (status === "loading") {
    return <div className="flex items-center gap-4">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/cart?type=wishlist" className="relative">
        <HeartIcon className="h-6 w-6" />
        {wishlistItems?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {wishlistItems.length}
          </span>
        )}
      </Link>
      <Link href="/cart" className="relative">
        <ShoppingCartIcon className="h-6 w-6" />
        {cartItems?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {cartItems.length}
          </span>
        )}
      </Link>
      <div className="flex items-center gap-4">
        {status === "authenticated" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : status === "unauthenticated" ? (
          <Button onClick={() => signIn("google")}>Sign in with Google</Button>
        ) : null}
      </div>
    </div>
  );
}
