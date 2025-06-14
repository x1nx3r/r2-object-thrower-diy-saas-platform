"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  fetchR2Credentials,
  saveR2Credentials as saveR2CredentialsAPI,
  deleteR2Credentials as deleteR2CredentialsAPI,
} from "@/lib/api/r2-credentials";
// Add this import at the top
import DebugConsole from "@/components/debug/DebugConsole";

// Import components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UserStats from "@/components/dashboard/UserStats";
import R2CredentialsManager from "@/components/dashboard/R2CredentialsManager";
import UploadManager from "@/components/dashboard/UploadManager";
import AccountInfo from "@/components/dashboard/AccountInfo";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // State
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [r2Credentials, setR2Credentials] = useState([]);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setError("Failed to load user profile");
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch R2 credentials using API
  useEffect(() => {
    const loadR2Credentials = async () => {
      if (user) {
        try {
          setCredentialsLoading(true);
          const credentials = await fetchR2Credentials();
          setR2Credentials(credentials);
          setError(null);
        } catch (error) {
          console.error("Error fetching R2 credentials:", error);
          setError("Failed to load R2 credentials");
          setR2Credentials([]);
        } finally {
          setCredentialsLoading(false);
        }
      }
    };

    loadR2Credentials();
  }, [user]);

  // Handlers
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAddCredential = async (credentialData) => {
    try {
      const savedCredential = await saveR2CredentialsAPI(credentialData);
      setR2Credentials([...r2Credentials, savedCredential]);
      setError(null);
      return savedCredential;
    } catch (error) {
      console.error("Error adding credential:", error);
      setError("Failed to save R2 credentials");
      throw error;
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    try {
      await deleteR2CredentialsAPI(credentialId);
      setR2Credentials(
        r2Credentials.filter((cred) => cred.id !== credentialId),
      );
      setError(null);
    } catch (error) {
      console.error("Error deleting credential:", error);
      setError("Failed to delete R2 credentials");
      throw error;
    }
  };

  // Loading state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-blue-800">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-white border-opacity-20"></div>
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-white border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">DIY R2 Thrower</h2>
          <p className="text-purple-100 animate-pulse">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect to auth
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={user}
        userProfile={userProfile}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">{error}</h3>
                <div className="mt-2">
                  <button
                    onClick={() => setError(null)}
                    className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* User Stats */}
          <UserStats
            userProfile={userProfile}
            credentialsCount={r2Credentials.length}
            credentialsLoading={credentialsLoading}
          />

          {/* Upload Manager - Only show if user has credentials */}
          {!credentialsLoading && r2Credentials.length > 0 && (
            <UploadManager credentials={r2Credentials} />
          )}

          {/* R2 Credentials Manager */}
          <R2CredentialsManager
            credentials={r2Credentials}
            loading={credentialsLoading}
            onAdd={handleAddCredential}
            onDelete={handleDeleteCredential}
          />

          {/* Account Information */}
          <AccountInfo user={user} userProfile={userProfile} />
        </div>
      </main>
      <DebugConsole />
    </div>
  );
}
