import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { NextResponse } from "next/server";

// Initialiser Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

const firebaseAdmin =
  getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

const adminStorage = getStorage(firebaseAdmin);

export async function POST(request: Request) {
  try {
    const { file, fileName } = await request.json();

    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileName);

    // Convertir le base64 en buffer
    const buffer = Buffer.from(file.split(",")[1], "base64");

    await fileRef.save(buffer, {
      contentType: "image/jpeg", // Ajustez selon le type de fichier
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
