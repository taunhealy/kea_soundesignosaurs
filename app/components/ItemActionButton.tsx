import { Button } from "./ui/button";
import { ShoppingCartIcon, DownloadIcon } from "lucide-react";
import { toast } from "react-hot-toast";

interface ItemActionButtonProps {
  itemId: string;
  itemType: 'preset' | 'pack';
  price?: number;
  downloadUrl?: string;
  userStatus?: 'uploaded' | 'downloaded' | null;
  hasPurchased?: boolean;
}

export function ItemActionButton({
  itemId,
  itemType,
  price,
  downloadUrl,
  userStatus,
  hasPurchased,
}: ItemActionButtonProps) {
  const handleDownload = async () => {
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
      link.download = `${itemType}.${itemType === 'preset' ? 'preset' : 'zip'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download started successfully");
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch("/api/cart/CART", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          itemId,
          itemType: itemType.toUpperCase()
        }),
      });
      if (!response.ok) throw new Error();
      toast.success(`${itemType === 'preset' ? 'Preset' : 'Pack'} added to cart`);
    } catch {
      toast.error(`Failed to add ${itemType} to cart`);
    }
  };

  return (
    <>
      {hasPurchased ? (
        <Button
          onClick={handleDownload}
          variant="secondary"
          className="w-full"
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          Download Preset
        </Button>
      ) : (
        <Button
          onClick={handleAddToCart}
          variant="default"
          className="w-full"
        >
          <ShoppingCartIcon className="mr-2 h-4 w-4" />
          Add to Cart ${price}
        </Button>
      )}
    </>
  );
}
