"use client";

import { Button } from "./ui/button";
import {
  ShoppingCartIcon,
  HeartIcon,
  EditIcon,
  TrashIcon,
  DownloadIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import { Edit2Icon } from "lucide-react";

interface ItemActionButtonsProps {
  id: string;
  price?: number;
  type: "preset" | "pack";
  onDelete?: () => Promise<void>;
  downloadUrl?: string;
  isOwner?: boolean;
}

export function ItemActionButtons({
  id,
  price,
  type,
  onDelete,
  downloadUrl,
  isOwner,
}: ItemActionButtonsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cart/CART", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type === "pack" ? "packId" : "presetId"]: id }),
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
        body: JSON.stringify({ [type === "pack" ? "packId" : "presetId"]: id }),
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

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!downloadUrl) {
      toast.error("No file available for download");
      return;
    }

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `download.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

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

  const commonButtons = (
    <>
      {price && price > 0 ? (
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
      ) : (
        <Button
          onClick={handleDownload}
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
      )}
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

  const ownerButtons = (
    <>
      <Link
        href={`/dashboard/${type}s/edit/${id}`}
        className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
      >
        <Edit2Icon className="h-4 w-4" />
      </Link>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="p-2 bg-white/90 rounded-full hover:bg-white hover:text-red-500 transition-colors"
          onClick={handleDelete}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
    </>
  );

  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex gap-2">
        {commonButtons}
        {isOwner && ownerButtons}
      </div>
    </div>
  );
}
