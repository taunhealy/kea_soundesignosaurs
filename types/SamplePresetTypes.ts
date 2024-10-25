export type Preset = {
  id: string;
  title: string;
  description: string;
  price: number;
  previewUrl: string;
  downloadUrl: string;
  genreId: string;
  soundDesignerId: string;
  createdAt?: Date;
  updatedAt?: Date;
  presetId: string;
  name: string;
  content: string;
  format: string;
  size: number;
};

export interface Sample {
  id: string;
  title: string;
  description: string;
  price: number;
  soundDesignerId: string;
  genreId: string;
  soundPreviewUrl: string;
  downloadUrl: string;
  // Add any other fields that are part of your Sample model
}

// You might want to create a union type for Algolia indexing
export interface AlgoliaIndexItem {
  objectID: string;
  title: string;
  description: string;
  price: number;
  soundDesignerId: string;
  genreId: string;
  objectType: "sample" | "preset";
  soundPreviewUrl?: string;
  downloadUrl?: string;
  // Add any other fields that might be specific to presets or samples
}

export type SampleInput = Omit<
  Sample,
  "id" | "soundDesignerId" | "createdAt" | "updatedAt"
>;

export type SampleWithRelations = Sample & {
  genre: {
    id: string;
    name: string;
  };
  soundDesigner: {
    id: string;
    name: string;
  };
};

export type SampleListResponse = {
  success: boolean;
  samples?: SampleWithRelations[];
  totalCount?: number;
  error?: string;
};

export type SampleResponse = {
  success: boolean;
  sample?: SampleWithRelations;
  error?: string;
};
