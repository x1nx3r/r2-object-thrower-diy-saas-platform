import { NextResponse } from "next/server";
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { encryptData, decryptData } from "@/lib/encryption";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

// Verify user authentication
async function verifyAuth(request) {
  try {
    // Initialize Firebase Admin
    getFirebaseAdmin();

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No authorization header");
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Auth verification error:", error);
    throw new Error("Unauthorized");
  }
}

// GET - Get specific credential
export async function GET(request, { params }) {
  try {
    const { id: credentialId } = await params;
    const userId = await verifyAuth(request);

    const docRef = doc(db, "users", userId, "r2Credentials", credentialId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 },
      );
    }

    const data = docSnap.data();
    const decryptedData = decryptData(data.encryptedData);

    return NextResponse.json({
      id: credentialId,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      ...decryptedData,
    });
  } catch (error) {
    console.error("Error fetching credential:", error);
    return NextResponse.json(
      { error: "Failed to fetch credential" },
      { status: 500 },
    );
  }
}

// DELETE - Delete credential
export async function DELETE(request, { params }) {
  try {
    const { id: credentialId } = await params;
    const userId = await verifyAuth(request);

    const docRef = doc(db, "users", userId, "r2Credentials", credentialId);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting credential:", error);
    return NextResponse.json(
      { error: "Failed to delete credential" },
      { status: 500 },
    );
  }
}

// PUT - Update credential
export async function PUT(request, { params }) {
  try {
    const { id: credentialId } = await params;
    const userId = await verifyAuth(request);
    const credentials = await request.json();

    const encryptedData = encryptData(credentials);

    const docRef = doc(db, "users", userId, "r2Credentials", credentialId);
    await setDoc(
      docRef,
      {
        name: credentials.name || "My R2 Account",
        encryptedData,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    return NextResponse.json({
      id: credentialId,
      ...credentials,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating credential:", error);
    return NextResponse.json(
      { error: "Failed to update credential" },
      { status: 500 },
    );
  }
}
