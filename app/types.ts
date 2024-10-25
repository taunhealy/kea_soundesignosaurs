export interface SoundDesigner {
  id: string;
  userId: string;
  name: string;
  email: string;
  profileImage: string | null;
  websiteUrl: string | null;
  presets: Preset[];
  samples: Sample[];
  tutorials: Tutorial[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Preset {
  id: string;
  title: string;
  description: string;
  price: number;
  fxGuide: string;
  spotifyLink: string | null;
  soundPreviewUrl: string;
  downloadUrl: string;
  soundDesignerId: string;
  genreId: string;
  vstId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sample {
  id: string;
  title: string;
  description: string;
  price: number;
  soundPreviewUrl: string;
  downloadUrl: string;
  soundDesignerId: string;
  genreId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  url: string;
  soundPreviewUrl: string;
  soundDesignerId: string;
  createdAt: Date;
  updatedAt: Date;
}
