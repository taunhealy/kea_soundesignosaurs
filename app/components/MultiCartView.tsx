"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { CartType } from "@prisma/client";
import {
  fetchCartItems,
  moveItem,
  selectCartItems,
  selectSavedItems,
  selectWishlistItems,
  deleteCartItem,
} from "../store/features/cartSlice";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CartItem } from "@/lib/interfaces";
import { Trash, MoveRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { PriceChangeDisplay } from "./PriceChangeDisplay";

interface CartItemComponentProps {
  item: CartItem;
  currentList: "CART" | "SAVED_FOR_LATER" | "WISHLIST";
  onMove: (to: "CART" | "SAVED_FOR_LATER" | "WISHLIST") => void;
  onDelete?: (id: string) => void;
  isLoading: boolean;
}

function CartItemComponent({
  item,
  currentList,
  onMove,
  onDelete,
  isLoading,
}: CartItemComponentProps) {
  console.log("Raw item data:", JSON.stringify(item, null, 2));

  const priceChange =
    item.priceHistory && item.priceHistory.length > 0
      ? {
          currentPrice: Number(item.price),
          previousPrice: Number(item.priceHistory[0].price),
          size: "md" as const,
        }
      : null;

  const moveOptions = {
    CART: ["SAVED_FOR_LATER", "WISHLIST"],
    SAVED_FOR_LATER: ["CART", "WISHLIST"],
    WISHLIST: ["CART", "SAVED_FOR_LATER"],
  };

  return (
    <li className="flex items-center justify-between p-4 bg-card rounded-lg shadow">
      <div className="flex items-center space-x-4">
        {item.imageString && (
          <img
            src={item.imageString}
            alt={item.name}
            className="w-16 h-16 object-cover rounded"
          />
        )}
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-muted-foreground">By {item.creator}</p>
          <div className="flex items-center space-x-2">
            <span className="font-bold">${item.price}</span>
            {priceChange && (
              <PriceChangeDisplay
                currentPrice={priceChange.currentPrice}
                previousPrice={priceChange.previousPrice}
                size={priceChange.size}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {moveOptions[currentList].map((option) => (
          <Button
            key={option}
            variant="outline"
            size="sm"
            onClick={() =>
              onMove(option as "CART" | "SAVED_FOR_LATER" | "WISHLIST")
            }
            disabled={isLoading}
          >
            <MoveRight className="w-4 h-4 mr-2" />
            {option.replace("_", " ")}
          </Button>
        ))}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item.id)}
            disabled={isLoading}
          >
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>
    </li>
  );
}

export function MultiCartView() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const savedItems = useAppSelector(selectSavedItems);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCartItems("cart"));
    dispatch(fetchCartItems("savedForLater"));
    dispatch(fetchCartItems("wishlist"));
  }, [dispatch]);

  const handleMoveItem = async (
    itemId: string,
    from: "CART" | "SAVED_FOR_LATER" | "WISHLIST",
    to: "CART" | "SAVED_FOR_LATER" | "WISHLIST"
  ) => {
    try {
      await dispatch(
        moveItem({
          itemId,
          from: from.toUpperCase() as CartType,
          to: to.toUpperCase() as CartType,
        })
      ).unwrap();
      toast.success(`Item moved to ${to.toLowerCase().replace("_", " ")}`);
    } catch (error) {
      toast.error("Failed to move item");
    }
  };

  const handleDelete = async (
    itemId: string,
    type: "CART" | "SAVED_FOR_LATER" | "WISHLIST"
  ) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
      setDeletingId(itemId);
      await dispatch(deleteCartItem({ itemId, type })).unwrap();
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Tabs defaultValue="cart" className="w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="cart">Cart ({cartItems.length})</TabsTrigger>
        <TabsTrigger value="saved">Saved ({savedItems.length})</TabsTrigger>
        <TabsTrigger value="wishlist">
          Wishlist ({wishlistItems.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cart">
        <ul className="space-y-4">
          {cartItems.map((item: CartItem) => (
            <CartItemComponent
              key={item.id}
              item={item}
              currentList="CART"
              onMove={(to) => handleMoveItem(item.id, "CART", to)}
              isLoading={false}
            />
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="saved">
        <ul className="space-y-4">
          {savedItems.map((item: CartItem) => (
            <CartItemComponent
              key={item.id}
              item={item}
              currentList="SAVED_FOR_LATER"
              onMove={(to) => handleMoveItem(item.id, "SAVED_FOR_LATER", to)}
              isLoading={false}
            />
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="wishlist">
        <ul className="space-y-4">
          {wishlistItems.map((item: CartItem) => (
            <CartItemComponent
              key={item.id}
              item={item}
              currentList="WISHLIST"
              onMove={(to) => handleMoveItem(item.id, "WISHLIST", to)}
              onDelete={(id) => handleDelete(id, "WISHLIST")}
              isLoading={deletingId === item.id}
            />
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
