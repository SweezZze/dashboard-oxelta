"use client";

import { ImageList } from "@/app/components/pub/ImageList";
import { ImageUploadForm } from "@/app/components/pub/ImageUploadForm";
import { WeekSelector } from "@/app/components/pub/WeekSelector";
import { ImageData } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PubPage() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weekImages, setWeekImages] = useState<ImageData[]>([]);

  const fetchWeekImages = async (weekNum: number) => {
    try {
      const response = await fetch(`/api/game-images?weekNumber=${weekNum}`);
      const data = await response.json();
      if (data.success) {
        setWeekImages(
          data.images.map((image: ImageData) => ({
            ...image,
            createdAt: new Date(image.createdAt),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Error loading images. Please try again.");
    }
  };

  useEffect(() => {
    if (selectedWeek) {
      fetchWeekImages(selectedWeek);
    }
  }, [selectedWeek]);

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleDateSelect = (date: Date) => {
    const weekNum = getWeekNumber(date);
    setSelectedWeek(weekNum);
    setShowForm(true);
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await fetch(`/api/game-images`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ docId: id }),
      });

      if (!response.ok) throw new Error("Failed to delete image");

      if (selectedWeek) {
        await fetchWeekImages(selectedWeek);
      }
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error deleting image. Please try again.");
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const week = getWeekNumber(date);
      if (week === selectedWeek) {
        return "selected-week";
      }
    }
    return "";
  };

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="container p-4 mx-auto max-w-7xl md:p-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">
          Publication Management
        </h1>
        <div className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-2">
          <div className="space-y-6">
            <WeekSelector
              selectedWeek={selectedWeek}
              onWeekSelect={handleDateSelect}
              tileClassName={tileClassName}
            />
            {showForm && (
              <ImageUploadForm
                selectedWeek={selectedWeek}
                onImageUpload={() =>
                  selectedWeek && fetchWeekImages(selectedWeek)
                }
              />
            )}
          </div>
          <ImageList
            selectedWeek={selectedWeek}
            images={weekImages}
            onDeleteImage={handleDeleteImage}
          />
        </div>
      </div>
      {/* Spacer */}
      <div className="h-[100px]"></div>
    </div>
  );
}
