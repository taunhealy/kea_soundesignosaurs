import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { createPreset } from "@/app/actions/presetActions";

export function UploadPresetButton() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (res: any) => {
    if (res && res[0]) {
      const formData = new FormData();
      formData.append("title", "New Preset");
      formData.append("description", "Description of the new preset");
      formData.append("price", "0");
      formData.append("fxGuide", "FX Guide for the new preset");
      formData.append("soundPreviewUrl", res[0].url);
      formData.append("downloadUrl", res[0].url);
      formData.append("genreId", "default-genre-id");
      formData.append("vstId", "default-vst-id");

      const result = await createPreset(formData);
      if (result.success) {
        alert("Preset uploaded successfully!");
      } else {
        alert("Failed to upload preset: " + result.error);
      }
    }
    setIsUploading(false);
  };

  return (
    <div>
      <h2>Upload Preset</h2>
      {isUploading ? (
        <p>Uploading...</p>
      ) : (
        <UploadDropzone
          endpoint="presetUploader"
          onClientUploadComplete={(res) => {
            setIsUploading(true);
            handleUpload(res);
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />
      )}
    </div>
  );
}

