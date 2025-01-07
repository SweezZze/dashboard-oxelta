"use client";

import { ImageCard } from "@/app/components/pub/ImageCard";
import { Card } from "@/components/ui/card";
import { ImageData } from "@/types";

type Props = {
  selectedWeek: number | null;
  images: ImageData[];
  onDeleteImage: (id: string) => void;
};

export const ImageList = ({ selectedWeek, images, onDeleteImage }: Props) => {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="p-6">
        <h2 className="mb-6 text-xl font-semibold tracking-tight text-card-foreground">
          {selectedWeek
            ? `Images for Week ${selectedWeek}`
            : "Select a week to view images"}
        </h2>
        <div className="space-y-4">
          {images.map((image, index) => (
            <ImageCard
              key={index}
              image={image}
              onDelete={() => onDeleteImage(image.id)}
            />
          ))}
          {images.length === 0 && selectedWeek && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No images found for this week
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
