"use client";

import "@/app/globals.css";
import { ChangeEvent, useEffect, useState } from "react";
import Calendar from "react-calendar";
import { toast } from "sonner";

type OfferType =
  | "Premium 1"
  | "Gold 1"
  | "Gold 2"
  | "Silver 1"
  | "Silver 2"
  | "Silver 3";
type PositionCode =
  | `P-1-1-${1 | 2 | 3 | 4 | 5 | 6}`
  | `P-1-2-${1 | 2 | 3 | 4 | 5 | 6}`
  | `G-1-1-${1 | 2 | 3}`
  | `G-1-2-${1 | 2 | 3}`
  | `G-2-1-${1 | 2 | 3}`
  | `G-2-2-${1 | 2 | 3}`
  | `S-1-1-${1 | 2 | 3 | 4}`
  | `S-1-2-${1 | 2 | 3}`
  | `S-2-1-${1 | 2 | 3 | 4}`
  | `S-2-2-${1 | 2 | 3}`
  | `S-3-1-${1 | 2 | 3 | 4}`
  | `S-3-2-${1 | 2 | 3}`;

const POSITIONS: Record<OfferType, PositionCode[]> = {
  "Premium 1": [
    "P-1-1-1",
    "P-1-1-2",
    "P-1-1-3",
    "P-1-1-4",
    "P-1-1-5",
    "P-1-1-6",
    "P-1-2-1",
    "P-1-2-2",
    "P-1-2-3",
    "P-1-2-4",
    "P-1-2-5",
    "P-1-2-6",
  ],
  "Gold 1": ["G-1-1-1", "G-1-1-2", "G-1-1-3", "G-1-2-1", "G-1-2-2", "G-1-2-3"],
  "Gold 2": ["G-2-1-1", "G-2-1-2", "G-2-1-3", "G-2-2-1", "G-2-2-2", "G-2-2-3"],
  "Silver 1": [
    "S-1-1-1",
    "S-1-1-2",
    "S-1-1-3",
    "S-1-1-4",
    "S-1-2-1",
    "S-1-2-2",
    "S-1-2-3",
  ],
  "Silver 2": [
    "S-2-1-1",
    "S-2-1-2",
    "S-2-1-3",
    "S-2-1-4",
    "S-2-2-1",
    "S-2-2-2",
    "S-2-2-3",
  ],
  "Silver 3": [
    "S-3-1-1",
    "S-3-1-2",
    "S-3-1-3",
    "S-3-1-4",
    "S-3-2-1",
    "S-3-2-2",
    "S-3-2-3",
  ],
} as const;

interface ImageData {
  id: string;
  imageUrl: string;
  offerType: OfferType;
  position: PositionCode;
  weekNumber: number;
  createdAt: Date;
  selectedFile?: File;
  company_name: string;
}

export default function PubPage() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weekImages, setWeekImages] = useState<ImageData[]>([]);
  const [imageData, setImageData] = useState<
    Omit<ImageData, "id" | "createdAt">
  >({
    imageUrl: "",
    offerType: "Premium 1",
    position: "P-1-1-1",
    weekNumber: 0,
    company_name: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (selectedWeek) {
      fetchWeekImages(selectedWeek);
    }
  }, [selectedWeek]);

  const fetchWeekImages = async (weekNum: number) => {
    try {
      const response = await fetch(`/api/game-images?weekNumber=${weekNum}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response");
      }

      const data = await response.json();
      console.log("Fetched images data:", data);
      if (data.images) {
        setWeekImages(
          data.images.map((image: ImageData) => ({
            ...image,
            createdAt: new Date(image.createdAt),
          }))
        );
      } else {
        throw new Error("No images found");
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

  const generatePublicUrl = (bucketName: string, imagePath: string): string => {
    return `https://storage.googleapis.com/${bucketName}/${imagePath}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!imageData.selectedFile) {
        toast.error("Please select an image first");
        return;
      }

      const formData = new FormData();

      // Générez le nom de fichier selon le format spécifié
      const fileExtension = imageData.selectedFile.name.split(".").pop();
      const customFileName = `week-${imageData.weekNumber}-${imageData.position}.${fileExtension}`;

      // Créez un nouveau fichier avec le nom personnalisé
      const renamedFile = new File([imageData.selectedFile], customFileName, {
        type: imageData.selectedFile.type,
      });

      formData.append("file", renamedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // Utilisez la fonction generatePublicUrl pour créer l'URL publique
      const bucketName = "flappyoxo.appspot.com";
      const imagePath = `pub_images/${customFileName}`;
      const imageUrl = generatePublicUrl(bucketName, imagePath);

      const customDocId = `week-${imageData.weekNumber}-${imageData.position}`;

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
          },
        }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save image");

      if (selectedWeek) {
        await fetchWeekImages(selectedWeek);
      }

      setShowForm(false);
      setImageData({
        imageUrl: "",
        offerType: "Premium 1",
        position: "P-1-1-1",
        weekNumber: selectedWeek || 0,
        company_name: "",
      });

      toast.success("Image saved successfully!");
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

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setImageData((prev) => ({
      ...prev,
      selectedFile: file,
    }));

    toast.success("Image selected. Click 'Save Image' to upload.");
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
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={imageData.company_name}
                      onChange={(e) =>
                        setImageData({
                          ...imageData,
                          company_name: e.target.value,
                        })
                      }
                      className="block w-full pl-2 mt-1 border rounded-md shadow-sm bg-input text-input-foreground focus:border-ring focus:ring-ring"
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Upload Image
                    </label>
                    <div className="mt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Uploading...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        Offer Type
                      </label>
                      <select
                        value={imageData.offerType}
                        onChange={(e) => {
                          const newOfferType = e.target.value as OfferType;
                          setImageData({
                            ...imageData,
                            offerType: newOfferType,
                            position: POSITIONS[newOfferType][0],
                          });
                        }}
                        className="block w-full mt-1 border rounded-md shadow-sm bg-input text-input-foreground focus:border-ring focus:ring-ring"
                      >
                        {Object.keys(POSITIONS).map((offer) => (
                          <option key={offer} value={offer}>
                            {offer}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        Position
                      </label>
                      <select
                        value={imageData.position}
                        onChange={(e) =>
                          setImageData({
                            ...imageData,
                            position: e.target.value as PositionCode,
                          })
                        }
                        className="block w-full mt-1 border rounded-md shadow-sm bg-input text-input-foreground focus:border-ring focus:ring-ring"
                      >
                        {POSITIONS[imageData.offerType].map((position) => (
                          <option key={position} value={position}>
                            {position}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          Offer Type: {image.offerType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Position: {image.position}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Company: {image.company_name}
                        </p>
                      </div>
                    </div>
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
      <div className="h-8"></div> {/* Spacer of 32px */}
    </div>
  );
}
