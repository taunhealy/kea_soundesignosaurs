import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { createSample } from "@/app/actions/sampleActions";

export function UploadSampleButton() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (res: any) => {
    if (res && res[0]) {
      const formData = new FormData();
      formData.append("title", "New Sample");
      formData.append("description", "Description of the new sample");
      formData.append("price", "0");
      formData.append("soundPreviewUrl", res[0].url);
      formData.append("downloadUrl", res[0].url);
      formData.append("genreId", "default-genre-id");

      const result = await createSample(formData);
      if (result.success) {
        alert("Sample uploaded successfully!");
      } else {
        alert("Failed to upload sample: " + result.error);
      }
    }
    setIsUploading(false);
  };

  return (
    <div>
      <h2>Upload Sample</h2>
      {isUploading ? (
        <p>Uploading...</p>
      ) : (
        <UploadDropzone
          endpoint="sampleUploader"
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
