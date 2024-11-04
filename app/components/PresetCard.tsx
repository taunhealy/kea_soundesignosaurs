import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { Preset } from "@/types/PresetTypes";
import { PresetCardProps } from "@/types/PresetTypes";

export function PresetCard({ preset, variant, actions }: PresetCardProps) {
  return (
    <Card className="relative group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-lg border">
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg font-semibold mb-2">
          {preset.title}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Price: {preset.price || "Free"}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            Designer:{" "}
            <span className="font-medium">
              {preset.soundDesigner?.username}
            </span>
          </div>
          <div>
            Genre:{" "}
            <span className="font-medium">
              {preset.genre?.name || "Unknown"}
            </span>
          </div>
          <div>
            VST: <span className="font-medium">{preset.vst || "N/A"}</span>
          </div>
          <div>
            Type:{" "}
            <span className="font-medium">
              {preset.presetType || "Uncategorized"}
            </span>
          </div>
        </div>
        {actions && <div className="mt-4">{actions}</div>}
      </CardContent>
    </Card>
  );
}
