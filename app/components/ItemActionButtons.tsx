"use client";

import { Button } from "./ui/button";
import {
  ShoppingCartIcon,
  HeartIcon,
  TrashIcon,
  EditIcon,
  Loader2Icon,
} from "lucide-react";
import { ContentViewMode } from "@/types/enums";
import { useItemActions } from "@/app/hooks/useItemActions";
import { ItemActionButtonsProps } from "@/types/actions";
import { DownloadButton } from "./shared/DownloadButton";

export function ItemActionButtons({
  itemId,
  itemType,
  contentViewMode,
  showDownload,
  price,
  isOwner = false,
}: ItemActionButtonsProps) {
  const {
    isDeleting,
    isAddingToCart,
    isAddingToWishlist,
    handleDelete,
    handleEdit,
    handleAddToCart,
    handleAddToWishlist,
  } = useItemActions({
    itemId,
    itemType,
    contentViewMode,
  });

  if (showDownload) {
    return (
      <div className="flex gap-2">
        <DownloadButton 
          itemId={itemId} 
          itemType={itemType} 
        />
        {!price && (  // Only show action buttons for free items
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
        )}
      </div>
    );
  }

  if (contentViewMode === ContentViewMode.UPLOADED) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => handleEdit()}
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        >
          <EditIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => handleDelete()}
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <TrashIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

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
