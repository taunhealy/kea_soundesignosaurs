import { useState, useCallback } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/app/components/ui/button";
import { FileIcon, X, Upload } from "lucide-react";

export function UploadPresetButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const uploadPresetMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/presets", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload preset");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
      alert("Preset uploaded successfully!");
    },
    onError: (error) => {
      alert(`Failed to upload preset: ${error.message}`);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleUpload = useCallback(
    async (res: any) => {
      if (res && res[0]) {
        setIsUploading(true);
        setUploadedFile({ url: res[0].url, name: res[0].name });

        const formData = new FormData();
        formData.append("title", "New Preset");
        formData.append("description", "Description of the new preset");
        formData.append("price", "0");
        formData.append("Guide", "Creation guide for the new preset");
        formData.append("soundPreviewUrl", res[0].url);
        formData.append("downloadUrl", res[0].url);
        formData.append("genreId", "default-genre-id");
        formData.append("vstId", "default-vst-id");

        await uploadPresetMutation.mutateAsync(formData);
      }
    },
    [uploadPresetMutation]
  );

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Upload Preset</h2>
      {isUploading ? (
        <p>Uploading...</p>
      ) : uploadedFile ? (
        <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
          <FileIcon className="w-6 h-6 text-blue-500" />
          <span className="flex-1 truncate">{uploadedFile.name}</span>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
            onClick={() => setUploadedFile(null)}
          >
            <Upload className="w-4 h-4" />
            <span>Choose file</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <UploadDropzone
          endpoint="presetUploader"
          onClientUploadComplete={handleUpload}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />
      )}
    </div>
  );
}
