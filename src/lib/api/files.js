// Client-side API calls for file management

// Get user's Firebase ID token for authentication
async function getAuthToken() {
  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();

  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  return await auth.currentUser.getIdToken();
}

// Fetch all files
export async function fetchFiles() {
  try {
    const token = await getAuthToken();

    const response = await fetch("/api/files", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }

    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
}

// Get presigned upload URL
// Get presigned upload URL
export async function getUploadUrl(fileName, fileSize, fileType, credentialId) {
  try {
    const token = await getAuthToken();

    const response = await fetch("/api/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileSize,
        fileType,
        credentialId,
      }),
    });

    // Add debugging
    console.log("Upload URL Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload URL Error Response:", errorText);
      throw new Error(
        `Failed to get upload URL: ${response.status} ${errorText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting upload URL:", error);
    throw error;
  }
}

// Upload file to R2
export async function uploadFile(file, presignedUrl) {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    return true;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Confirm upload (save metadata)
export async function confirmUpload(fileId, fileMetadata) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`/api/files/${fileId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileMetadata }),
    });

    if (!response.ok) {
      throw new Error("Failed to confirm upload");
    }

    return await response.json();
  } catch (error) {
    console.error("Error confirming upload:", error);
    throw error;
  }
}

// Get download URL
export async function getDownloadUrl(fileId) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`/api/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get download URL");
    }

    const data = await response.json();
    return data.downloadUrl;
  } catch (error) {
    console.error("Error getting download URL:", error);
    throw error;
  }
}

// Delete file
export async function deleteFile(fileId) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`/api/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete file");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
