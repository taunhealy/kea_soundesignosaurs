"use client";

import { Button } from "./ui/button";
import {
  ShoppingCartIcon,
  HeartIcon,
  TrashIcon,
  DownloadIcon,
  EditIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { DownloadButton } from "@/app/components/shared/DownloadButton";

interface ItemActionButtonsProps {
  itemId: string;
  price?: number;
  type: "preset" | "pack";
  onDelete?: () => Promise<void>;
  downloadUrl?: string;
  itemStatus: "uploaded" | "downloaded" | null;
  itemType?: "preset" | "pack";
  title?: string;
  showDownloadOnly?: boolean;
}

export function ItemActionButtons({
  itemId,
  type,
  itemStatus,
  downloadUrl,
  onDelete,
}: ItemActionButtonsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cart/CART", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [type === "pack" ? "packId" : "presetId"]: itemId,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to add to cart" }));
        throw new Error(errorData.error || "Failed to add to cart");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart"
      );
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cart/WISHLIST", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [type === "pack" ? "packId" : "presetId"]: itemId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409) {
          toast.error(error.error);
          return null;
        }
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        toast.success("Added to wishlist");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to wishlist"
      );
    },
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/${type}s/edit/${itemId}`);
  };

  // If it's a downloaded item, show download and delete buttons
  if (itemStatus === "downloaded") {
    return (
      <>
        <DownloadButton
          itemId={itemId}
          itemType="preset"
          downloadUrl={downloadUrl}
        />
      </>
    );
  }

  // If it's an uploaded item, show edit, delete, and download buttons
  if (itemStatus === "uploaded") {
    return (
      <>
        <Button
          onClick={handleEdit}
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        >
          <EditIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
        <DownloadButton
          itemId={itemId}
          itemType="preset"
          downloadUrl={downloadUrl}
        />
      </>
    );
  }

  // Default case: show cart and wishlist buttons
  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          addToCartMutation.mutate();
        }}
        variant="secondary"
        size="icon"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
      >
        <ShoppingCartIcon className="h-4 w-4" />
      </Button>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          addToWishlistMutation.mutate();
        }}
        variant="secondary"
        size="icon"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
      >
        <HeartIcon className="h-4 w-4" />
      </Button>
    </>
  );
}
