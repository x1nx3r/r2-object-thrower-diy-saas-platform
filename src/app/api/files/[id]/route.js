import { NextResponse } from "next/server";
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { decryptData } from "@/lib/encryption";

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

// Get R2 credential by ID
async function getR2Credential(userId, credentialId) {
  try {
    const docRef = doc(db, "users", userId, "r2Credentials", credentialId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("R2 credential not found");
    }

    const data = docSnap.data();
    const decryptedData = decryptData(data.encryptedData);

    return {
      id: credentialId,
      name: data.name,
      ...decryptedData,
    };
  } catch (error) {
    console.error("Error getting R2 credential:", error);
    throw new Error("Failed to retrieve R2 credential");
  }
}

// Create S3 client for R2
// Update createR2Client function here too
function createR2Client(credentials) {
  const endpoint = credentials.s3Endpoint || credentials.endpoint;

  console.log("Creating R2 client with endpoint:", endpoint);

  return new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  });
}

// PUT - Confirm file upload (save metadata)
export async function PUT(request, { params }) {
  try {
    const { id: fileId } = await params;
    const userId = await verifyAuth(request);
    const { fileMetadata } = await request.json();

    console.log("Confirming upload for file:", fileId);

    // Save file metadata to Firestore
    const fileDoc = {
      ...fileMetadata,
      status: "uploaded",
      uploadedAt: new Date(),
    };

    const docRef = doc(db, "users", userId, "files", fileId);
    await setDoc(docRef, fileDoc);

    // Update user usage stats
    const userRef = doc(db, "users", userId);

    try {
      await updateDoc(userRef, {
        "usage.totalFiles": increment(1),
        "usage.totalSize": increment(fileMetadata.size),
        "usage.lastCalculated": new Date(),
      });
    } catch (updateError) {
      // If usage field doesn't exist, create it
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};

      const currentUsage = userData.usage || { totalFiles: 0, totalSize: 0 };
      const newUsage = {
        totalFiles: currentUsage.totalFiles + 1,
        totalSize: currentUsage.totalSize + fileMetadata.size,
        lastCalculated: new Date(),
      };

      await setDoc(userRef, { usage: newUsage }, { merge: true });
    }

    console.log("File upload confirmed successfully:", fileId);

    return NextResponse.json({
      file: {
        ...fileDoc,
        uploadedAt: {
          seconds: Math.floor(fileDoc.uploadedAt.getTime() / 1000),
          nanoseconds: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error confirming upload:", error);
    return NextResponse.json(
      { error: `Failed to confirm upload: ${error.message}` },
      { status: 500 },
    );
  }
}

// GET - Generate download URL
export async function GET(request, { params }) {
  try {
    const { id: fileId } = await params;
    const userId = await verifyAuth(request);

    console.log("Generating download URL for file:", fileId);

    // Get file metadata
    const fileRef = doc(db, "users", userId, "files", fileId);
    const fileDoc = await getDoc(fileRef);

    if (!fileDoc.exists()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileData = fileDoc.data();

    // If we have a public URL, return it directly
    if (fileData.publicUrl) {
      console.log("Returning public URL for:", fileId);
      return NextResponse.json({
        downloadUrl: fileData.publicUrl,
        isPublic: true,
      });
    }

    // Get R2 credentials for generating presigned URL
    const credential = await getR2Credential(userId, fileData.credentialId);

    // If we have a public domain but no stored public URL, generate it
    if (credential.publicDomain) {
      const publicUrl = `${credential.publicDomain.replace(/\/$/, "")}/${fileData.r2Key}`;
      console.log("Generated public URL on-the-fly:", publicUrl);
      return NextResponse.json({
        downloadUrl: publicUrl,
        isPublic: true,
      });
    }

    // Otherwise, generate a presigned download URL
    console.log("Generating presigned download URL for:", fileId);

    const r2Client = createR2Client(credential);

    // Generate presigned download URL
    const command = new GetObjectCommand({
      Bucket: fileData.r2Bucket,
      Key: fileData.r2Key,
    });

    const downloadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });

    console.log("Presigned download URL generated successfully for:", fileId);

    return NextResponse.json({
      downloadUrl,
      isPublic: false,
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: `Failed to generate download URL: ${error.message}` },
      { status: 500 },
    );
  }
}

// DELETE - Delete file
export async function DELETE(request, { params }) {
  try {
    const { id: fileId } = await params;
    const userId = await verifyAuth(request);

    console.log("Deleting file:", fileId);

    // Get file metadata
    const fileRef = doc(db, "users", userId, "files", fileId);
    const fileDoc = await getDoc(fileRef);

    if (!fileDoc.exists()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileData = fileDoc.data();

    // Get R2 credentials and delete from R2
    try {
      const credential = await getR2Credential(userId, fileData.credentialId);
      const r2Client = createR2Client(credential);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: fileData.r2Bucket,
        Key: fileData.r2Key,
      });

      await r2Client.send(deleteCommand);
      console.log("File deleted from R2:", fileData.r2Key);
    } catch (r2Error) {
      console.error("Error deleting from R2 (continuing anyway):", r2Error);
      // Continue with metadata deletion even if R2 deletion fails
    }

    // Delete metadata from Firestore
    await deleteDoc(fileRef);

    // Update user usage stats
    const userRef = doc(db, "users", userId);

    try {
      await updateDoc(userRef, {
        "usage.totalFiles": increment(-1),
        "usage.totalSize": increment(-fileData.size),
        "usage.lastCalculated": new Date(),
      });
    } catch (updateError) {
      console.error("Error updating usage stats:", updateError);
      // Continue even if usage update fails
    }

    console.log("File deleted successfully:", fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: `Failed to delete file: ${error.message}` },
      { status: 500 },
    );
  }
}
