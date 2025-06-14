import { NextResponse } from "next/server";
import { doc, collection, getDocs, setDoc } from "firebase/firestore";
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

// GET - Fetch all credentials for user
export async function GET(request) {
  try {
    const userId = await verifyAuth(request);

    const credentialsRef = collection(db, "users", userId, "r2Credentials");
    const snapshot = await getDocs(credentialsRef);

    const credentials = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      try {
        const decryptedData = decryptData(data.encryptedData);
        credentials.push({
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          ...decryptedData,
        });
      } catch (error) {
        console.error(`Failed to decrypt credential ${doc.id}:`, error);
      }
    });

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json(
      { error: "Failed to fetch credentials" },
      { status: 500 },
    );
  }
}

// POST - Save new credentials
export async function POST(request) {
  try {
    const userId = await verifyAuth(request);
    const credentials = await request.json();

    const encryptedData = encryptData(credentials);

    const credentialDoc = {
      name: credentials.name || "My R2 Account",
      encryptedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const credentialId = credentials.id || `r2_${Date.now()}`;
    const docRef = doc(db, "users", userId, "r2Credentials", credentialId);

    await setDoc(docRef, credentialDoc);

    return NextResponse.json({
      id: credentialId,
      ...credentialDoc,
      ...credentials,
    });
  } catch (error) {
    console.error("Error saving credentials:", error);
    return NextResponse.json(
      { error: "Failed to save credentials" },
      { status: 500 },
    );
  }
}
