import { PresetUpload } from "@prisma/client";
import { DownloadButton } from "@/app/components/shared/DownloadButton";
import { ItemActionButtons } from "@/app/components/ItemActionButtons";

interface PresetActionsProps {
  preset: PresetUpload;
  currentUserId: string | null;
}

export function usePresetActions({
  preset,
  currentUserId,
}: PresetActionsProps) {
  const isOwner = preset.userId === currentUserId;
  const isFree = preset.priceType === "FREE";

  const getActionButtons = () => {
    if (isOwner) {
      return <DownloadButton itemId={preset.id} itemType="preset" />;
    }

    if (isFree) {
      return (
        <div className="flex gap-2">
          <DownloadButton itemId={preset.id} itemType="preset" />
          <ItemActionButtons
            itemId={preset.id}
            itemType="preset"
            type="preset"
            itemStatus="uploaded"
            showDownloadOnly={true}
          />
        </div>
      );
    }

    return (
      <ItemActionButtons
        itemId={preset.id}
        itemType="preset"
        type="preset"
        itemStatus="uploaded"
        price={preset.price ?? undefined}
      />
    );
  };

  return {
    isOwner,
    isFree,
    getActionButtons,
  };
}
