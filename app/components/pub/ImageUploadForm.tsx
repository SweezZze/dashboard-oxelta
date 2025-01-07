"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DIMENSIONS } from "@/lib/constants";
import { ImageData } from "@/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  selectedWeek: number | null;
  onImageUpload: () => void;
};

export const ImageUploadForm = ({ selectedWeek, onImageUpload }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<
    Omit<ImageData, "id" | "dimensions" | "createdAt" | "imageUrl">
  >({
    format: "PNG",
    height: 1,
    width: 1,
    weekNumber: selectedWeek || 0,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      console.log("Uploading file...");
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload response:", errorText);
        throw new Error("Upload failed: " + errorText);
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload response:", uploadData);

      if (!uploadData.success) {
        throw new Error(uploadData.error || "Upload failed");
      }

      const imageUrl = uploadData.imageLinks[0];

      // Then save the image data
      const dimensions = DIMENSIONS[`${imageData.height}-${imageData.width}`];
      if (!dimensions) {
        throw new Error("Invalid dimensions");
      }

      const customDocId = `week-${imageData.weekNumber}-h-${imageData.height}-l-${imageData.width}`;

      const saveResponse = await fetch("/api/game-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customDocId,
          imageData: {
            ...imageData,
            imageUrl,
            dimensions,
          },
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save image data");
      }

      setFile(null);
      onImageUpload();
      toast.success("Image uploaded and saved successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="p-6">
        <h2 className="mb-6 text-xl font-semibold tracking-tight text-card-foreground">
          Add Image for Week {selectedWeek}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Image File
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Format
            </label>
            <select
              value={imageData.format}
              onChange={(e) =>
                setImageData({
                  ...imageData,
                  format: e.target.value as "PNG" | "JPEG",
                })
              }
              className="w-full px-3 py-2 border rounded-md shadow-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="PNG">PNG</option>
              <option value="JPEG">JPEG</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Height
              </label>
              <select
                value={imageData.height}
                onChange={(e) =>
                  setImageData({
                    ...imageData,
                    height: parseInt(e.target.value) as 1 | 2 | 3,
                  })
                }
                className="w-full px-3 py-2 border rounded-md shadow-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num}>
                    Height {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Width
              </label>
              <select
                value={imageData.width}
                onChange={(e) =>
                  setImageData({
                    ...imageData,
                    width: parseInt(e.target.value) as
                      | 1
                      | 2
                      | 3
                      | 4
                      | 5
                      | 6
                      | 7
                      | 8,
                  })
                }
                className="w-full px-3 py-2 border rounded-md shadow-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    Width {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Save Image"
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};
