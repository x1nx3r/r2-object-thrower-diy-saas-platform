// Client-side API calls for R2 credentials

// Get user's Firebase ID token for authentication
async function getAuthToken() {
  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();

  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  return await auth.currentUser.getIdToken();
}

// Fetch all credentials
export async function fetchR2Credentials() {
  try {
    const token = await getAuthToken();

    const response = await fetch("/api/r2-credentials", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch credentials");
    }

    const data = await response.json();
    return data.credentials;
  } catch (error) {
    console.error("Error fetching credentials:", error);
    throw error;
  }
}

// Save new credentials
export async function saveR2Credentials(credentials) {
  try {
    const token = await getAuthToken();

    const response = await fetch("/api/r2-credentials", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Failed to save credentials");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving credentials:", error);
    throw error;
  }
}

// Delete credentials
export async function deleteR2Credentials(credentialId) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`/api/r2-credentials/${credentialId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete credentials");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting credentials:", error);
    throw error;
  }
}

// Get specific credential
export async function getR2Credential(credentialId) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`/api/r2-credentials/${credentialId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch credential");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching credential:", error);
    throw error;
  }
}
