import { ContentViewMode } from "./enums";
import { ItemType } from "@prisma/client";

export interface ItemActionButtonsProps {
  itemId: string;
  itemType: ItemType;
  contentViewMode: ContentViewMode;
  showDownload?: boolean;
  price?: number;
  isOwner?: boolean;
}

export interface UseItemActionsProps {
  itemId: string;
  itemType: ItemType;
  contentViewMode: ContentViewMode;
}

export interface ItemActionsState {
  isDeleting: boolean;
  isAddingToCart: boolean;
  isAddingToWishlist: boolean;
  isMovingToCart: boolean;
  isRemoving: boolean;
  isEditing: boolean;
}
