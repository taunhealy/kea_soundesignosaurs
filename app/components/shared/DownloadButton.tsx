import { Button } from "@/app/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "react-toastify";

interface DownloadButtonProps {
  itemId: string;
  itemType: "preset";
  downloadUrl?: string;
}

export function DownloadButton({
  itemId,
  itemType,
  downloadUrl,
}: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      // First get the secure download URL from our API
      const response = await fetch(`/api/downloads/preset/${itemId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get download URL");
      }

      const data = await response.json();
      console.log("Download response:", data);

      if (!data.downloadUrl) {
        throw new Error("No download URL available");
      }

      // Create download link
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.filename || `${itemType}-${itemId}.preset`; // Use filename from API if available

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error instanceof Error ? error.message : "Download failed");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDownload}
      title={`Download ${itemType}`}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}
