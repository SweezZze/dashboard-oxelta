import { adminStorage } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `pub_images/${file.name}`;

      const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

      if (!bucketName) {
        console.error("Storage bucket name not specified");
        return NextResponse.json(
          { error: "Storage bucket name not specified" },
          { status: 500 }
        );
      }

      const bucket = adminStorage.bucket(bucketName);

      if (!bucket) {
        console.error("Could not get storage bucket");
        return NextResponse.json(
          { error: "Could not get storage bucket" },
          { status: 500 }
        );
      }

      const fileRef = bucket.file(filename);

      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });

      // Make the file publicly accessible
      await fileRef.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      return NextResponse.json({ url: publicUrl });
    } catch (uploadError) {
      console.error("Firebase upload error:", uploadError);
      return NextResponse.json(
        { error: `Error uploading to Firebase Storage: ${uploadError}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      { error: `Error processing upload request: ${error}` },
      { status: 500 }
    );
  }
}
