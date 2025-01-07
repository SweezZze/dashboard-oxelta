import { initializeFirebaseAdmin } from "@/lib/firebase-admin";
import {
  DocumentData,
  getFirestore,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase-admin";

// Initialisation de Firebase Admin
initializeFirebaseAdmin();

// Define an interface for the image data
interface ImageData {
  id?: string;
  imageUrl: string;
  format: "PNG" | "JPEG";
  height: number;
  width: number;
  weekNumber: number;
  dimensions: { width: number; height: number };
  createdAt?: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekNumber = searchParams.get("weekNumber");

    if (!weekNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Week number is required",
        },
        { status: 400 }
      );
    }

    const imagesRef = adminDb.collection("game-images");
    const query = imagesRef.where("weekNumber", "==", parseInt(weekNumber, 10));

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        images: [],
      });
    }

    const images = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as ImageData;
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Date
              ? data.createdAt
              : data.createdAt
              ? new Date(data.createdAt)
              : new Date(),
        };
      }
    );

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Error fetching game images:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch images",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { customDocId, imageData } = await request.json();

    const docRef = adminDb.collection("game-images").doc(customDocId);
    await docRef.set({
      ...imageData,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: customDocId,
    });
  } catch (error) {
    console.error("Error saving game image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save image",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { docId } = body;

    // Validation de base
    if (!docId || typeof docId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Document ID est requis et doit être une chaîne",
        },
        { status: 400 }
      );
    }

    const firestore = getFirestore();
    const imageRef = firestore.collection("game-images").doc(docId);

    try {
      // Suppression du document Firestore
      await imageRef.delete();

      return NextResponse.json({
        success: true,
        message: "Image supprimée avec succès",
      });
    } catch (deleteError) {
      console.error("Erreur de suppression Firestore:", deleteError);

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de supprimer l'image",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur inattendue",
      },
      { status: 500 }
    );
  }
}
