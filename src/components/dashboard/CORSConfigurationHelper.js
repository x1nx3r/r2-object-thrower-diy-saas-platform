"use client";

import { useState } from "react";

export default function CORSConfigurationHelper({ credentials }) {
  const [selectedCredential, setSelectedCredential] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const selectedCred = credentials.find((c) => c.id === selectedCredential);

  // Generate CORS configuration for the selected credential
  const generateCORSConfig = (credential) => {
    if (!credential) return null;

    const config = [
      {
        AllowedOrigins: [
          "http://localhost:3000",
          "http://localhost:3001",
          "https://your-domain.com", // User should replace this
          window.location.origin, // Current domain
        ],
        AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        AllowedHeaders: ["*"],
        ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
        MaxAgeSeconds: 3600,
      },
    ];

    return JSON.stringify(config, null, 2);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("CORS configuration copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("CORS configuration copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🌐 CORS Configuration Helper
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Configure Cross-Origin Resource Sharing for your R2 buckets to
              enable uploads
            </p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
          >
            {showGuide ? "Hide Guide" : "Show Setup Guide"}
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="p-6 bg-blue-50 border-b border-gray-200">
          <h4 className="font-semibold text-blue-900 mb-4">
            📋 Step-by-Step CORS Setup
          </h4>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  Go to Cloudflare R2 Dashboard
                </p>
                <p className="text-sm text-blue-700">
                  Navigate to your Cloudflare dashboard → R2 Object Storage
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-blue-900">Select Your Bucket</p>
                <p className="text-sm text-blue-700">
                  Click on the bucket you want to configure for uploads
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  Go to Settings → CORS Policy
                </p>
                <p className="text-sm text-blue-700">
                  In your bucket dashboard, find the Settings tab and look for
                  CORS policy
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  Add CORS Configuration
                </p>
                <p className="text-sm text-blue-700">
                  Copy the generated JSON below and paste it into the CORS
                  policy field
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                5
              </div>
              <div>
                <p className="font-medium text-blue-900">Save and Test</p>
                <p className="text-sm text-blue-700">
                  Save the configuration and try uploading a file to test
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                Important: CORS changes may take a few minutes to propagate
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Credential Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select R2 Account to Configure
          </label>
          <select
            value={selectedCredential}
            onChange={(e) => setSelectedCredential(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose an R2 account...</option>
            {credentials.map((cred) => (
              <option key={cred.id} value={cred.id}>
                {cred.name} ({cred.bucket})
              </option>
            ))}
          </select>
        </div>

        {selectedCred && (
          <div className="space-y-6">
            {/* Bucket Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                📦 Bucket Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Bucket Name:
                  </span>
                  <span className="ml-2 text-gray-900 font-mono">
                    {selectedCred.bucket}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    S3 Endpoint:
                  </span>
                  <span className="ml-2 text-gray-600 font-mono text-xs">
                    {(
                      selectedCred.s3Endpoint || selectedCred.endpoint
                    )?.replace("https://", "")}
                  </span>
                </div>
                {selectedCred.publicDomain && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Public Domain:
                    </span>
                    <span className="ml-2 text-gray-600 font-mono text-xs">
                      {selectedCred.publicDomain.replace("https://", "")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Generated CORS Configuration */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">
                  🔧 CORS Configuration
                </h4>
                <button
                  onClick={() =>
                    copyToClipboard(generateCORSConfig(selectedCred))
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Configuration
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {generateCORSConfig(selectedCred)}
                </pre>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <strong>Note:</strong> Replace "https://your-domain.com" with
                  your actual production domain.
                </p>
              </div>
            </div>

            {/* Configuration Explanation */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">
                🔍 What This Configuration Does
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">
                    AllowedOrigins
                  </span>
                  <span>
                    Allows requests from localhost (development) and your domain
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">
                    AllowedMethods
                  </span>
                  <span>
                    Permits GET, PUT, POST, DELETE, and HEAD requests for full
                    functionality
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">
                    AllowedHeaders
                  </span>
                  <span>Allows all headers (*) for maximum compatibility</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">
                    ExposeHeaders
                  </span>
                  <span>
                    Exposes important response headers for upload verification
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs">
                    MaxAgeSeconds
                  </span>
                  <span>
                    Caches preflight requests for 1 hour to improve performance
                  </span>
                </div>
              </div>
            </div>

            {/* Testing Section */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">
                ✅ Testing Your Configuration
              </h4>
              <div className="space-y-2 text-sm text-green-800">
                <p>After applying the CORS configuration:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Wait 2-3 minutes for changes to propagate</li>
                  <li>Try uploading a small test file</li>
                  <li>Check browser developer tools for any CORS errors</li>
                  <li>
                    If upload fails, verify the configuration was saved
                    correctly
                  </li>
                </ul>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-3">
                ⚠️ Common Issues & Solutions
              </h4>
              <div className="space-y-3 text-sm text-red-800">
                <div>
                  <p className="font-medium">
                    Error: "CORS policy blocked the request"
                  </p>
                  <p className="text-red-700">
                    → CORS not configured or still propagating. Wait a few
                    minutes and try again.
                  </p>
                </div>
                <div>
                  <p className="font-medium">
                    Error: "Access to fetch blocked by CORS policy"
                  </p>
                  <p className="text-red-700">
                    → Your domain is not in AllowedOrigins. Add your domain to
                    the configuration.
                  </p>
                </div>
                <div>
                  <p className="font-medium">
                    Error: "Method PUT is not allowed by
                    Access-Control-Allow-Methods"
                  </p>
                  <p className="text-red-700">
                    → PUT method not allowed. Make sure "PUT" is in
                    AllowedMethods.
                  </p>
                </div>
                <div>
                  <p className="font-medium">
                    Upload starts but fails with 403
                  </p>
                  <p className="text-red-700">
                    → Check your R2 API credentials and bucket permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedCred && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-5xl mb-4">🌐</div>
            <p className="text-gray-600">
              Select an R2 account above to generate CORS configuration
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
