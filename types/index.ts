export type ImageData = {
  id: string;
  imageUrl: string;
  format: "PNG" | "JPEG";
  height: 1 | 2 | 3;
  width: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  weekNumber: number;
  dimensions: { width: number; height: number };
  createdAt: Date;
};

export type DimensionKey = `${1 | 2 | 3}-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;
