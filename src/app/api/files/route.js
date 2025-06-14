import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  doc,
  collection,
  getDocs,
  setDoc,
  getDoc,
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

// Update the createR2Client function
function createR2Client(credentials) {
  // Use s3Endpoint for API operations, fallback to old 'endpoint' field for backward compatibility
  let endpoint = credentials.s3Endpoint || credentials.endpoint;

  // Auto-correct endpoint if it includes bucket name
  if (endpoint && credentials.bucket) {
    // Remove bucket name from endpoint if it's there
    const bucketSuffix = `/${credentials.bucket}`;
    if (endpoint.endsWith(bucketSuffix)) {
      endpoint = endpoint.replace(bucketSuffix, "");
      console.log(
        "Auto-corrected endpoint by removing bucket suffix:",
        endpoint,
      );
    }
  }

  console.log("Creating R2 client with endpoint:", endpoint);
  console.log("Bucket will be specified separately:", credentials.bucket);

  return new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  });
}

// GET - Fetch all files for user
export async function GET(request) {
  try {
    const userId = await verifyAuth(request);
    console.log("Fetching files for user:", userId);

    const filesRef = collection(db, "users", userId, "files");
    const snapshot = await getDocs(filesRef);

    const files = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      files.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to serializable format
        uploadedAt: data.uploadedAt?.toDate
          ? {
              seconds: data.uploadedAt.seconds,
              nanoseconds: data.uploadedAt.nanoseconds,
            }
          : data.uploadedAt,
      });
    });

    // Sort by upload date (newest first)
    files.sort((a, b) => {
      const aTime = a.uploadedAt?.seconds || 0;
      const bTime = b.uploadedAt?.seconds || 0;
      return bTime - aTime;
    });

    console.log(`Returning ${files.length} files for user ${userId}`);
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}

// POST - Generate presigned upload URL
// POST - Generate presigned upload URL
export async function POST(request) {
  try {
    const userId = await verifyAuth(request);
    const { fileName, fileSize, fileType, credentialId } = await request.json();

    console.log("Creating upload URL for:", {
      fileName,
      fileSize,
      fileType,
      credentialId,
      userId,
    });

    // Get R2 credentials
    const credential = await getR2Credential(userId, credentialId);
    console.log("Using R2 credential:", credential.name);
    console.log("S3 Endpoint:", credential.s3Endpoint || credential.endpoint);
    console.log("Public Domain:", credential.publicDomain || "None");

    const r2Client = createR2Client(credential);

    // Generate unique file key
    const timestamp = Date.now();
    const fileExtension = fileName.split(".").pop();
    const baseName =
      fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const r2Key = `users/${userId}/${timestamp}-${sanitizedBaseName}.${fileExtension}`;

    console.log("Generated R2 key:", r2Key);

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: credential.bucket,
      Key: r2Key,
      ContentType: fileType,
      CacheControl: "max-age=31536000",
      Metadata: {
        "uploaded-by": userId,
        "original-name": fileName,
        "upload-timestamp": timestamp.toString(),
      },
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });

    console.log("Generated presigned URL successfully");
    console.log("URL domain:", new URL(presignedUrl).hostname);

    // ENHANCED: Generate public URL with multiple fallback options
    let publicUrl = null;

    if (credential.publicDomain) {
      // Custom domain
      publicUrl = `${credential.publicDomain.replace(/\/$/, "")}/${r2Key}`;
      console.log("Using custom domain for public URL:", publicUrl);
    } else {
      // Try to detect R2 public development URL from the bucket configuration
      // Extract account ID from S3 endpoint
      const s3Endpoint = credential.s3Endpoint || credential.endpoint;
      if (s3Endpoint) {
        const match = s3Endpoint.match(
          /https:\/\/([a-f0-9]+)\.r2\.cloudflarestorage\.com/,
        );
        if (match) {
          const accountId = match[1];
          // Generate the pub-*.r2.dev URL format
          // Note: This might need adjustment based on actual bucket configuration
          publicUrl = `https://pub-${accountId}.r2.dev/${r2Key}`;
          console.log("Generated R2 development public URL:", publicUrl);
        }
      }
    }

    console.log("Final public URL:", publicUrl);

    // Prepare file metadata
    const fileMetadata = {
      id: `file_${timestamp}`,
      name: fileName,
      size: fileSize,
      type: fileType,
      r2Key: r2Key,
      r2Bucket: credential.bucket,
      credentialId: credentialId,
      credentialName: credential.name,
      publicUrl: publicUrl,
      status: "pending",
    };

    return NextResponse.json({
      presignedUrl,
      fileMetadata,
    });
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    return NextResponse.json(
      { error: `Failed to create upload URL: ${error.message}` },
      { status: 500 },
    );
  }
}
