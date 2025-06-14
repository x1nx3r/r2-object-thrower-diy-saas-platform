import { initializeApp, getApps, cert } from "firebase-admin/app";

let adminApp = null;

export function getFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }

  try {
    // Check if already initialized
    const existingApp = getApps().find((app) => app.name === "[DEFAULT]");
    if (existingApp) {
      adminApp = existingApp;
      return adminApp;
    }

    // Get the base64 service account key
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set",
      );
    }

    // Decode the base64 service account
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, "base64").toString("utf-8"),
    );

    // Initialize Firebase Admin
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");
    return adminApp;
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
  }
}
