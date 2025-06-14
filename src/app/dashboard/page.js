// src/app/dashboard/page.js
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">DIY R2 Thrower</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-700">
                  {userProfile?.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome to your Dashboard! 🎉
          </h2>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Plan
              </h3>
              <p className="text-2xl font-bold text-purple-600 capitalize">
                {userProfile?.plan || "Free"}
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Total Uploads
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {userProfile?.totalUploads || 0}
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Storage Used
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {userProfile?.totalStorage
                  ? `${(userProfile.totalStorage / 1024 / 1024).toFixed(2)} MB`
                  : "0 MB"}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>User ID:</strong> {user.uid}
              </p>
              <p>
                <strong>Member since:</strong>{" "}
                {userProfile?.createdAt
                  ? new Date(
                      userProfile.createdAt.seconds * 1000,
                    ).toLocaleDateString()
                  : "Today"}
              </p>
              <p>
                <strong>Last login:</strong>{" "}
                {userProfile?.lastLogin
                  ? new Date(
                      userProfile.lastLogin.seconds * 1000,
                    ).toLocaleString()
                  : "Now"}
              </p>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              🚀 Coming Soon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">📁 Credential Manager</h4>
                <p className="text-sm">Securely store your R2 credentials</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">☁️ File Uploader</h4>
                <p className="text-sm">Beautiful drag & drop interface</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">📊 Usage Analytics</h4>
                <p className="text-sm">Track your storage and usage</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">🔗 File Management</h4>
                <p className="text-sm">View and manage uploaded files</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
