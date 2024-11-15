import { Button } from "@/app/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { ItemType } from "@prisma/client";

interface DownloadButtonProps {
  itemId: string;
  itemType: ItemType;
  downloadUrl?: string;
}

export function DownloadButton({
  itemId,
  itemType,
  downloadUrl,
}: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      // Use existing API routes
      const endpoint = `/api/downloads/${itemType}/${itemId}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get download URL");
      }

      const data = await response.json();
      console.log("Download response:", data);

      if (itemType === ItemType.PRESET) {
        // Single preset download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.filename || `preset-${itemId}.preset`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Pack download - create zip file
        const zip = new JSZip();

        // Add each preset to the zip
        for (const preset of data.presets) {
          const presetResponse = await fetch(preset.url);
          const presetBlob = await presetResponse.blob();
          zip.file(`${preset.title}.preset`, presetBlob);
        }

        // Generate and download zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = zipUrl;
        link.download = `${data.packTitle || `pack-${itemId}`}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);
      }

      toast.success(
        `${itemType === ItemType.PRESET ? "Preset" : "Pack"} download started`
      );
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
