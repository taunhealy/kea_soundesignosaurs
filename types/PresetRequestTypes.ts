export interface RequestSubmission {
  id: string;
  userId: string;
  username: string;
  title: string;
  soundPreviewUrl?: string;
  presetFileUrl?: string;
  guide?: string;
  timestamp: string;
}

export interface PresetRequest {
  id: string;
  userId: string;
  title: string;
  youtubeLink: string;
  timestamp: string;
  genre: string;
  status: "OPEN" | "ASSISTED" | "SATISFIED";
  soundDesigner: {
    username: string;
  };
  enquiryDetails: string;
  submissions?: RequestSubmission[];
}
