import {
  BoardView,
  ContentType,
  ContentViewMode,
  RequestViewMode,
} from "./enums";
import { PresetPack } from "@/lib/interfaces";
import { Preset } from "./algolia-autocomplete";
import { PresetPackWithRelations } from "./presetPack";
import { PresetRequestWithRelations } from "./PresetRequestTypes";
import { PresetUpload, VST, Genre, SoundDesigner } from "@prisma/client";

export interface ContentExplorerProps {
  contentType: ContentType;
  boardView: BoardView;
  onViewChange?: (view: string) => void;
}

export interface ContentExplorerTabState {
  contentType: ContentType;
  activeTab: ContentViewMode | RequestViewMode;
  viewMode: string;
  status: string;
}

export interface PresetGridProps {
  presets?: (PresetUpload & {
    vst?: VST | null;
    genre?: Genre | null;
    soundDesigner?: SoundDesigner | null;
  })[];
  contentViewMode: ContentViewMode;
  isLoading: boolean;
  view?: string | null;
}

export interface PresetPackGridProps {
  packs?: PresetPackWithRelations[];
  contentViewMode: ContentViewMode;
  isLoading: boolean;
}

export interface PresetRequestGridProps {
  requests?: PresetRequestWithRelations[];
  requestViewMode: RequestViewMode;
  isLoading: boolean;
}

export interface CategoryTabsProps {
  selectedContentType: ContentType;
  onSelect: (contentType: ContentType) => void;
  boardView: BoardView;
}
