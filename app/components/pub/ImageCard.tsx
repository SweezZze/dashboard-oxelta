"use client";

import { ImageData } from "@/types";
import { Trash2 } from "lucide-react";

type Props = {
  image: ImageData;
  onDelete: () => void;
};

export const ImageCard = ({ image, onDelete }: Props) => {
  return (
    <div className="overflow-hidden transition-all duration-200 border rounded-lg hover:bg-accent/50 group">
      <div className="p-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={image.imageUrl}
                alt={`Week ${image.weekNumber} image`}
                className="object-cover w-20 h-20 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Format: {image.format}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Dimensions: {image.dimensions.width}x{image.dimensions.height}px
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Position: H{image.height} W{image.width}
              </p>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="p-2 transition-colors rounded-md text-destructive opacity-70 hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
            title="Delete image"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
