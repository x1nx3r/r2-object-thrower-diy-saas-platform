"use client";

import { useState, useEffect } from "react";
import { fetchFiles } from "@/lib/api/files";

export default function UserStats({
  userProfile,
  credentialsCount,
  credentialsLoading,
}) {
  const [fileStats, setFileStats] = useState({ count: 0, totalSize: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadFileStats = async () => {
      try {
        const files = await fetchFiles();
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        setFileStats({ count: files.length, totalSize });
      } catch (error) {
        console.error("Error loading file stats:", error);
        setFileStats({ count: 0, totalSize: 0 });
      } finally {
        setStatsLoading(false);
      }
    };

    if (!credentialsLoading && credentialsCount > 0) {
      loadFileStats();
    } else {
      setStatsLoading(false);
    }
  }, [credentialsLoading, credentialsCount]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 MB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome to your Dashboard! 🎉
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Plan</h3>
          <p className="text-2xl font-bold text-purple-600 capitalize">
            {userProfile?.plan || "Free"}
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Files Uploaded
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {statsLoading ? "..." : fileStats.count}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Storage Used
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {statsLoading ? "..." : formatFileSize(fileStats.totalSize)}
          </p>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            R2 Accounts
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            {credentialsLoading ? "..." : credentialsCount}
          </p>
        </div>
      </div>
    </div>
  );
}
