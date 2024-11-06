"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PresetDownload, PresetUpload, PriceType } from "@prisma/client";
import { ItemActionButtons } from "./ItemActionButtons";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface PresetCardProps {
  preset: PresetUpload & {
    soundDesigner?: { username: string | null } | null;
    genre?: { name: string } | null;
    vst?: { name: string } | null;
    downloads?: PresetDownload[];
  };
  variant?: string;
  currentUserId?: string | null;
  type?: "uploaded" | "downloaded" | "explore" | undefined;
}

export function PresetCard({
  preset,
  variant,
  currentUserId,
  type,
}: PresetCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/presetUpload/${preset.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Delete response:", {
          status: response.status,
          data,
        });
        throw new Error(data.error || "Failed to delete preset");
      }

      return data;
    },
    onSuccess: (data) => {
      console.log("Delete success:", data);
      queryClient.invalidateQueries({ queryKey: ["presets"] });
      toast.success("Preset deleted successfully");
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete preset"
      );
    },
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      // Error is handled in the mutation callbacks
    }
  };

  console.log("Preset data:", preset);
  console.log("VST data:", preset.vst);
  if (!preset) return null;

  const displayPrice =
    preset.priceType === PriceType.FREE ? "Free" : `$${preset.price}`;

  return (
    <Card className="w-full relative group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-lg border">
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg font-semibold mb-2">
          {preset.title}
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{displayPrice}</span>
          <ItemActionButtons
            itemId={preset.id}
            type="preset"
            itemStatus={
              type === "uploaded"
                ? "uploaded"
                : type === "downloaded"
                ? "downloaded"
                : null
            }
            downloadUrl={preset.presetFileUrl ?? undefined}
            title={preset.title}
            onDelete={type === "uploaded" ? handleDelete : undefined}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            Designer:{" "}
            <span className="font-medium">
              {preset.soundDesigner?.username || "Anonymous"}
            </span>
          </div>
          <div>
            File:{" "}
            <span className="font-medium">
              {preset.originalFileName ||
                preset.presetFileUrl?.split("/").pop() ||
                "Unnamed"}
            </span>
          </div>
          <div>
            Genre:{" "}
            <span className="font-medium">
              {preset.genre?.name || "Unknown"}
            </span>
          </div>
          <div>
            VST:{" "}
            <span className="font-medium">
              {preset.vst?.name || preset.vstId || "N/A"}
            </span>
          </div>
          <div>
            Type:{" "}
            <span className="font-medium">
              {preset.presetType || "Uncategorized"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
