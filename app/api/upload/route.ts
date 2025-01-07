import { storage } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const compressedBuffer = await sharp(buffer)
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileName = `images_pub/${Date.now()}_${file.name}`;
    const fileRef = storage.bucket().file(fileName);

    await fileRef.save(compressedBuffer, {
      contentType: "image/jpeg",
      metadata: {
        contentType: "image/jpeg",
        cacheControl: "public, max-age=31536000",
      },
    });

    return NextResponse.json({
      success: true,
      imageLinks: [fileName],
    });
  } catch (error) {
    console.error("Error uploading:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
