import { adminStorage } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const bucket = adminStorage.bucket();
    const fileName = `publications/${Date.now()}-${file.name}`;
    const fileRef = bucket.file(fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fileRef.save(buffer, {
      contentType: file.type,
      public: true,
    });

    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du téléchargement" },
      { status: 500 }
    );
  }
}
