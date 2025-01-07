"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ImageUploadForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Image uploaded successfully!");
        console.log("Uploaded image path:", data.imageLinks[0]);
        setFile(null);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload image: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="max-w-md p-6 mx-auto mt-8">
      <h1 className="mb-4 text-2xl font-bold">Upload Image</h1>
      <div className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Image"
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ImageUploadForm;
