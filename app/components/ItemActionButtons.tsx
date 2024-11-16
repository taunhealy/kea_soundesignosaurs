"use client";

import { Button } from "./ui/button";
import {
  ShoppingCartIcon,
  HeartIcon,
  TrashIcon,
  EditIcon,
  Loader2Icon,
} from "lucide-react";
import { useItemActions } from "@/app/hooks/useItemActions";
import { ItemActionButtonsProps } from "@/types/actions";
import { DownloadButton } from "./shared/DownloadButton";
import { ItemType } from "@prisma/client";

export function ItemActionButtons({
  itemId,
  itemType,
  isOwner,
  isDownloaded,
  onDelete,
  onEdit,
}: ItemActionButtonsProps) {
  const {
    isAddingToCart,
    isAddingToWishlist,
    handleAddToCart,
    handleAddToWishlist,
  } = useItemActions({
    itemId,
    itemType,
  });

  // Show download button if user owns or has downloaded the item
  if (isOwner || isDownloaded) {
    return (
      <div className="flex gap-2">
        <DownloadButton
          itemId={itemId}
          itemType={itemType.toLowerCase() as ItemType}
        />
        {isOwner && (
          <div className="flex gap-2">
            <Button
              onClick={onEdit}
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show cart/wishlist buttons for non-owned/non-downloaded items
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleAddToCart()}
        variant="secondary"
        size="icon"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        disabled={isAddingToCart}
      >
        {isAddingToCart ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCartIcon className="h-4 w-4" />
        )}
      </Button>
      <Button
        onClick={() => handleAddToWishlist()}
        variant="secondary"
        size="icon"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        disabled={isAddingToWishlist}
      >
        {isAddingToWishlist ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <HeartIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
