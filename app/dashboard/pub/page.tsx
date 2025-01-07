"use client";

import "@/app/globals.css";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { toast } from "sonner";

interface ImageData {
  id: string;
  imageUrl: string;
  format: "PNG" | "JPEG";
  height: 1 | 2 | 3;
  width: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  weekNumber: number;
  dimensions: { width: number; height: number };
  createdAt: Date;
}

type DimensionKey = `${1 | 2 | 3}-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

const DIMENSIONS: Record<DimensionKey, { width: number; height: number }> = {
  "1-1": { width: 100, height: 100 },
  "1-2": { width: 150, height: 100 },
  "1-3": { width: 200, height: 100 },
  "1-4": { width: 250, height: 100 },
  "1-5": { width: 300, height: 100 },
  "1-6": { width: 350, height: 100 },
  "1-7": { width: 400, height: 100 },
  "1-8": { width: 450, height: 100 },
  "2-1": { width: 100, height: 200 },
  "2-2": { width: 150, height: 200 },
  "2-3": { width: 200, height: 200 },
  "2-4": { width: 250, height: 200 },
  "2-5": { width: 300, height: 200 },
  "2-6": { width: 350, height: 200 },
  "2-7": { width: 400, height: 200 },
  "2-8": { width: 450, height: 200 },
  "3-1": { width: 100, height: 300 },
  "3-2": { width: 150, height: 300 },
  "3-3": { width: 200, height: 300 },
  "3-4": { width: 250, height: 300 },
  "3-5": { width: 300, height: 300 },
  "3-6": { width: 350, height: 300 },
  "3-7": { width: 400, height: 300 },
  "3-8": { width: 450, height: 300 },
};

export default function PubPage() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weekImages, setWeekImages] = useState<ImageData[]>([]);
  const [imageData, setImageData] = useState<
    Omit<ImageData, "dimensions" | "createdAt">
  >({
    imageUrl: "",
    format: "PNG",
    height: 1,
    width: 1,
    weekNumber: 0,
    id: "",
  });

  useEffect(() => {
    if (selectedWeek) {
      fetchWeekImages(selectedWeek);
    }
  }, [selectedWeek]);

  const fetchWeekImages = async (weekNum: number) => {
    try {
      const response = await fetch(`/api/game-images?weekNumber=${weekNum}`);
      const data = await response.json();
      if (data.images) {
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

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getWeekDates = (date: Date) => {
    const currentDate = new Date(date);
    const day = currentDate.getDay();
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - day + (day === 0 ? -6 : 1));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { monday, sunday };
  };

  const handleDateSelect = (date: Date) => {
    const weekNum = getWeekNumber(date);
    setSelectedWeek(weekNum);
    setShowForm(true);
    setImageData((prev) => ({ ...prev, weekNumber: weekNum }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dimensions = DIMENSIONS[`${imageData.height}-${imageData.width}`];
      if (!dimensions) {
        toast.error("Invalid dimensions");
        return;
      }

      const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!imageUrlPattern.test(imageData.imageUrl)) {
        toast.error(
          "Please enter a valid image URL (must end with .jpg, .png)"
        );
        return;
      }

      try {
        const response = await fetch(imageData.imageUrl, { method: "HEAD" });
        if (!response.ok) {
          toast.error(
            "The image URL is not accessible. Please check the URL and try again."
          );
          return;
        }
      } catch (error: unknown) {
        console.error("URL verification error:", error);
        toast.error(
          "Could not verify the image URL. Please check the URL and try again."
        );
        return;
      }

      const customDocId = `week-${imageData.weekNumber}-h-${imageData.height}-l-${imageData.width}`;

      const response = await fetch("/api/game-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customDocId,
          imageData: {
            ...imageData,
            dimensions,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to save image");

      if (selectedWeek) {
        await fetchWeekImages(selectedWeek);
      }

      setShowForm(false);
      setImageData({
        imageUrl: "",
        format: "PNG",
        height: 1,
        width: 1,
        weekNumber: selectedWeek || 0,
        id: "",
      });

      toast.success("Image saved successfully!", {
        description: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await fetch(`/api/game-images?docId=${customDocId}`, {
                method: "DELETE",
              });
              if (selectedWeek) {
                await fetchWeekImages(selectedWeek);
              }
              toast.success("Image deleted successfully!");
            } catch (error) {
              console.error("Error deleting image:", error);
              toast.error("Error deleting image. Please try again.");
            }
          },
        },
      });
    } catch (error) {
      console.error("Error saving image data:", error);
      toast.error("Error saving image data. Please try again.");
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month" && selectedWeek) {
      const currentDate = new Date(date);
      const selectedDate = new Date();
      selectedDate.setDate(
        selectedDate.getDate() +
          (selectedWeek - getWeekNumber(selectedDate)) * 7
      );

      const { monday, sunday } = getWeekDates(selectedDate);

      // Vérifier si la date est dans la semaine sélectionnée
      const isInSelectedWeek = currentDate >= monday && currentDate <= sunday;

      return `
        hover:bg-accent hover:text-accent-foreground
        focus:bg-accent focus:text-accent-foreground
        ${isInSelectedWeek ? "bg-primary text-primary-foreground" : ""}
        ${date.getDay() === 0 || date.getDay() === 6 ? "text-destructive" : ""}
      `.trim();
    }
    return "";
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/game-images?docId=${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete image");

      toast.success("Image deleted successfully!");
      if (selectedWeek) {
        await fetchWeekImages(selectedWeek);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error deleting image. Please try again.");
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] overflow-y-auto bg-background">
      <div className="p-4 mx-auto max-w-7xl md:p-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">
          Pub Management
        </h1>
        <div className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-2">
          {/* Colonne de gauche : Calendrier et formulaire */}
          <div className="space-y-6">
            <div className="overflow-hidden border shadow-sm bg-card rounded-xl">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-card-foreground">
                  Select Week
                </h2>
                <Calendar
                  onChange={(value: any) => handleDateSelect(value as Date)}
                  className="w-full border-none rounded-lg bg-card text-card-foreground"
                  tileClassName={tileClassName}
                />
              </div>
            </div>

            {showForm && (
              <div className="p-6 border shadow-sm bg-card rounded-xl">
                <h2 className="mb-4 text-xl font-semibold text-card-foreground">
                  Add Image for Week {selectedWeek}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={imageData.imageUrl}
                      onChange={(e) =>
                        setImageData({ ...imageData, imageUrl: e.target.value })
                      }
                      className="block w-full mt-1 border rounded-md shadow-sm bg-input text-input-foreground focus:border-ring focus:ring-ring"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
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
                        className="block w-full mt-1 border rounded-md shadow-sm bg-input text-input-foreground focus:border-ring focus:ring-ring"
                      >
                        <option value="PNG">PNG</option>
                        <option value="JPEG">JPEG</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        Height
                      </label>
                      <select
                        value={imageData.height}
                        onChange={(e) =>
                          setImageData({
                            ...imageData,
                            height: Number(e.target.value) as 1 | 2 | 3,
                          })
                        }
                        className="block w-full mt-1 border rounded-md shadow-sm bg-input text-input-foreground focus:border-ring focus:ring-ring"
                      >
                        {[1, 2, 3].map((num) => (
                          <option key={num} value={num}>
                            Height {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        Width
                      </label>
                      <select
                        value={imageData.width}
                        onChange={(e) =>
                          setImageData({
                            ...imageData,
                            width: Number(e.target.value) as
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
                        className="block w-full mt-1 border rounded-md shadow-sm bg-input text-input-foreground focus:border-ring focus:ring-ring"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            Width {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-md bg-muted">
                    <p className="text-sm text-muted-foreground">
                      Selected dimensions:{" "}
                      {DIMENSIONS[`${imageData.height}-${imageData.width}`]
                        ?.width || 0}{" "}
                      x{" "}
                      {DIMENSIONS[`${imageData.height}-${imageData.width}`]
                        ?.height || 0}
                      px
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    Save Image
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Colonne de droite : Liste des images */}
          <div className="p-6 border shadow-sm bg-card rounded-xl">
            <h2 className="mb-4 text-xl font-semibold text-card-foreground">
              {selectedWeek
                ? `Images for Week ${selectedWeek}`
                : "Select a week to view images"}
            </h2>

            <div className="space-y-4">
              {weekImages.map((image, index) => (
                <div
                  key={index}
                  className="p-4 transition-colors border rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={image.imageUrl}
                          alt={`Week ${image.weekNumber} image`}
                          className="object-cover w-20 h-20 rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          Format: {image.format}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Dimensions: {image.dimensions.width}x
                          {image.dimensions.height}px
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Position: H{image.height} W{image.width}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-2 transition-colors rounded-md text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      title="Delete image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {weekImages.length === 0 && selectedWeek && (
                <p className="py-4 text-center text-muted-foreground">
                  No images found for this week
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
