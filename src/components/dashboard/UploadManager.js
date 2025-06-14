"use client";

import { useState } from "react";
import FileUploader from "@/components/upload/FileUploader";
import FileBrowser from "@/components/upload/FileBrowser";
import CORSConfigurationHelper from "./CORSConfigurationHelper";

export default function UploadManager({ credentials }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = (file) => {
    console.log("Upload completed:", file);
    // Trigger file browser refresh
    setRefreshTrigger((prev) => prev + 1);

    // Switch to browser tab to show the uploaded file
    setActiveTab("browse");
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);

    // If it's a CORS error, suggest checking CORS configuration
    if (error.includes("CORS") || error.includes("network error")) {
      const shouldShowCORS = confirm(
        "Upload failed with a network/CORS error. Would you like to check your CORS configuration?",
      );
      if (shouldShowCORS) {
        setActiveTab("cors");
      }
    }
  };

  const handleFileDeleted = (fileId) => {
    console.log("File deleted:", fileId);
    // File browser already handles the state update
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-8 pt-6">
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "upload"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📤 Upload Files
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "browse"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📁 Browse Files
          </button>
          <button
            onClick={() => setActiveTab("cors")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "cors"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            🌐 CORS Setup
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === "upload" && (
          <FileUploader
            credentials={credentials}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        )}

        {activeTab === "browse" && (
          <FileBrowser
            onFileDeleted={handleFileDeleted}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === "cors" && (
          <CORSConfigurationHelper credentials={credentials} />
        )}
      </div>
    </div>
  );
}
