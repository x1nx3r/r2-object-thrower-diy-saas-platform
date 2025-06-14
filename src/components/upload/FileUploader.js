"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { getUploadUrl, uploadFile, confirmUpload } from "@/lib/api/files";

export default function FileUploader({
  credentials,
  onUploadComplete,
  onUploadError,
}) {
  const [selectedCredential, setSelectedCredential] = useState(
    credentials[0]?.id || "",
  );
  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!selectedCredential) {
        onUploadError?.("Please select an R2 account first");
        return;
      }

      // Check if selected credential is properly configured
      const credential = credentials.find((c) => c.id === selectedCredential);
      if (!credential) {
        onUploadError?.("Selected R2 account not found");
        return;
      }

      // Warn about old format credentials
      if (credential.endpoint && !credential.s3Endpoint) {
        onUploadError?.(
          "Selected R2 account uses old format. Please update your credentials to separate S3 API endpoint from public domain.",
        );
        return;
      }

      if (!credential.s3Endpoint && !credential.endpoint) {
        onUploadError?.(
          "Selected R2 account is missing S3 API endpoint. Please update your credentials.",
        );
        return;
      }

      console.log("Starting upload with credential:", {
        id: selectedCredential,
        name: credential.name,
        hasS3Endpoint: !!credential.s3Endpoint,
        hasPublicDomain: !!credential.publicDomain,
        needsMigration: !!(credential.endpoint && !credential.s3Endpoint),
      });

      setIsUploading(true);

      const newUploads = acceptedFiles.map((file) => ({
        id: `upload_${Date.now()}_${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "preparing",
        error: null,
        startTime: Date.now(),
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Process uploads one by one
      for (const upload of newUploads) {
        try {
          await processUpload(upload);
        } catch (error) {
          console.error(`Failed to upload ${upload.name}:`, error);
          updateUploadStatus(upload.id, "error", 0, error.message);
        }
      }

      setIsUploading(false);
    },
    [selectedCredential, credentials, onUploadError],
  );

  const processUpload = async (upload) => {
    try {
      console.log("Processing upload:", {
        name: upload.name,
        size: upload.size,
        type: upload.type,
        credentialId: selectedCredential,
      });

      // Validate credential selection
      if (!selectedCredential) {
        throw new Error("No R2 credential selected");
      }

      // Update status to uploading
      updateUploadStatus(upload.id, "uploading", 10);

      // Get presigned URL with detailed logging
      console.log("Getting upload URL for credential:", selectedCredential);
      const response = await getUploadUrl(
        upload.file.name,
        upload.file.size,
        upload.file.type,
        selectedCredential,
      );

      console.log("Upload URL response:", {
        hasPresignedUrl: !!response.presignedUrl,
        hasFileMetadata: !!response.fileMetadata,
        urlDomain: response.presignedUrl
          ? new URL(response.presignedUrl).hostname
          : "N/A",
      });

      if (!response.presignedUrl || !response.fileMetadata) {
        throw new Error("Invalid response from upload URL API");
      }

      updateUploadStatus(upload.id, "uploading", 30);

      // Upload to R2 with comprehensive progress tracking
      console.log("Starting file upload to R2...");
      await uploadFileWithProgress(upload, response.presignedUrl);

      updateUploadStatus(upload.id, "processing", 90);

      // Confirm upload (save metadata)
      console.log("Confirming upload with metadata...");
      const result = await confirmUpload(
        response.fileMetadata.id,
        response.fileMetadata,
      );

      updateUploadStatus(upload.id, "completed", 100);

      // Calculate upload time
      const uploadTime = Date.now() - upload.startTime;
      console.log(
        `Upload completed successfully in ${uploadTime}ms:`,
        upload.name,
      );

      // Notify parent component
      onUploadComplete?.(result.file);
    } catch (error) {
      console.error("Upload process error:", error);
      updateUploadStatus(upload.id, "error", 0, error.message);
      onUploadError?.(error.message);
    }
  };

  const uploadFileWithProgress = async (upload, presignedUrl) => {
    return new Promise((resolve, reject) => {
      console.log("Starting XHR upload to URL:", {
        domain: new URL(presignedUrl).hostname,
        protocol: new URL(presignedUrl).protocol,
        pathname: new URL(presignedUrl).pathname.substring(0, 50) + "...",
      });

      const xhr = new XMLHttpRequest();
      const startTime = Date.now();

      // Progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 60) + 30; // 30-90%
          const speed = event.loaded / ((Date.now() - startTime) / 1000); // bytes per second
          console.log(
            `Upload progress: ${progress}% (${event.loaded}/${event.total} bytes, ${Math.round(speed / 1024)} KB/s)`,
          );
          updateUploadStatus(upload.id, "uploading", progress);
        }
      });

      // Success handler
      xhr.addEventListener("load", () => {
        const uploadTime = Date.now() - startTime;
        console.log("XHR upload completed:", {
          status: xhr.status,
          statusText: xhr.statusText,
          time: `${uploadTime}ms`,
          responseLength: xhr.response?.length || 0,
        });

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          console.error("Upload failed with response:", xhr.responseText);
          reject(
            new Error(
              `Upload failed with status ${xhr.status}: ${xhr.statusText}. Response: ${xhr.responseText}`,
            ),
          );
        }
      });

      // Error handler
      xhr.addEventListener("error", (event) => {
        console.error("XHR upload error:", {
          type: event.type,
          status: xhr.status,
          statusText: xhr.statusText,
          readyState: xhr.readyState,
          responseText: xhr.responseText,
        });

        let errorMessage = "Upload failed - network error";

        if (xhr.status === 0) {
          errorMessage =
            "Upload failed - CORS error or network blocked. Check your R2 bucket CORS configuration.";
        } else if (xhr.status === 403) {
          errorMessage =
            "Upload failed - Access denied. Check your R2 credentials and bucket permissions.";
        } else if (xhr.status === 404) {
          errorMessage =
            "Upload failed - Bucket not found. Check your R2 bucket name.";
        }

        reject(new Error(errorMessage));
      });

      // Timeout handler
      xhr.addEventListener("timeout", () => {
        console.error("XHR upload timeout after", xhr.timeout, "ms");
        reject(new Error("Upload failed - timeout"));
      });

      // Load start/end for debugging
      xhr.addEventListener("loadstart", () => {
        console.log("XHR upload started");
      });

      xhr.addEventListener("loadend", () => {
        console.log("XHR upload ended");
      });

      // CORS preflight detection
      xhr.addEventListener("readystatechange", () => {
        console.log(`XHR readyState changed to: ${xhr.readyState}`);
        if (xhr.readyState === 2) {
          // HEADERS_RECEIVED
          console.log("Response headers:", xhr.getAllResponseHeaders());
        }
      });

      try {
        xhr.open("PUT", presignedUrl);

        // Set essential headers
        xhr.setRequestHeader("Content-Type", upload.file.type);

        // Set timeout
        xhr.timeout = 300000; // 5 minute timeout

        console.log("XHR configured, starting upload...", {
          method: "PUT",
          contentType: upload.file.type,
          fileSize: upload.file.size,
          timeout: xhr.timeout,
        });

        xhr.send(upload.file);
      } catch (error) {
        console.error("XHR setup error:", error);
        reject(new Error(`Upload setup failed: ${error.message}`));
      }
    });
  };

  const updateUploadStatus = (uploadId, status, progress, error = null) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === uploadId
          ? { ...upload, status, progress, error }
          : upload,
      ),
    );
  };

  const removeUpload = (uploadId) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== uploadId));
  };

  const clearCompleted = () => {
    setUploads((prev) =>
      prev.filter((upload) => upload.status !== "completed"),
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading || credentials.length === 0,
    accept: undefined,
    maxSize: undefined,
  });

  // Show message if no credentials
  if (credentials.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">🔑</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No R2 Credentials
        </h3>
        <p className="text-gray-600 mb-4">
          Add your R2 credentials first to start uploading files.
        </p>
      </div>
    );
  }

  // Get selected credential info
  const selectedCredentialInfo = credentials.find(
    (c) => c.id === selectedCredential,
  );
  const hasValidCredential =
    selectedCredentialInfo &&
    (selectedCredentialInfo.s3Endpoint || selectedCredentialInfo.endpoint) &&
    !(selectedCredentialInfo.endpoint && !selectedCredentialInfo.s3Endpoint);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Files</h3>

        {/* R2 Account Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload to R2 Account
          </label>
          <select
            value={selectedCredential}
            onChange={(e) => {
              console.log("Selected credential changed to:", e.target.value);
              setSelectedCredential(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isUploading}
          >
            <option value="">Select an R2 account...</option>
            {credentials.map((cred) => {
              const needsMigration = cred.endpoint && !cred.s3Endpoint;
              return (
                <option key={cred.id} value={cred.id}>
                  {cred.name} ({cred.bucket}){" "}
                  {needsMigration ? "⚠️ Needs Update" : ""}
                </option>
              );
            })}
          </select>

          {/* Credential Status */}
          {selectedCredentialInfo && (
            <div className="mt-2 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Configuration Status:
                </span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        hasValidCredential ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-600">
                      {hasValidCredential
                        ? "Ready for Upload"
                        : "Needs Configuration"}
                    </span>
                  </div>
                  {selectedCredentialInfo.publicDomain && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                      <span className="text-xs text-gray-600">
                        Public Access
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {!hasValidCredential && (
                <p className="text-xs text-red-600 mt-1">
                  This credential needs to be updated with proper S3 API
                  endpoint.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-purple-400 bg-purple-50"
                : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
            }
            ${isUploading || !hasValidCredential ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />

          <div className="text-gray-400 text-6xl mb-4">
            {isDragActive ? "📂" : "☁️"}
          </div>

          {!selectedCredential ? (
            <p className="text-gray-500 text-lg">
              Please select an R2 account first
            </p>
          ) : !hasValidCredential ? (
            <div>
              <p className="text-red-500 text-lg mb-2">
                Selected account needs configuration update
              </p>
              <p className="text-gray-500 text-sm">
                Please update your R2 credentials to use the new format
              </p>
            </div>
          ) : isDragActive ? (
            <p className="text-purple-600 text-lg font-medium">
              Drop files here to upload
            </p>
          ) : (
            <div>
              <p className="text-gray-600 text-lg mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-gray-400 text-sm">Any file type • Any size</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-900">
              Upload Progress ({uploads.length})
            </h4>
            {uploads.some((u) => u.status === "completed") && (
              <button
                onClick={clearCompleted}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="space-y-3">
            {uploads.map((upload) => (
              <UploadItem
                key={upload.id}
                upload={upload}
                onRemove={removeUpload}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced upload item component with better error display
function UploadItem({ upload, onRemove }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "preparing":
        return "bg-blue-500";
      case "uploading":
        return "bg-purple-500";
      case "processing":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "preparing":
        return "Preparing...";
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing...";
      case "completed":
        return "Completed";
      case "error":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getElapsedTime = () => {
    if (!upload.startTime) return "";
    const elapsed = Date.now() - upload.startTime;
    return `${Math.round(elapsed / 1000)}s`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {upload.type.startsWith("image/")
              ? "🖼️"
              : upload.type.startsWith("video/")
                ? "🎥"
                : upload.type.startsWith("audio/")
                  ? "🎵"
                  : "📄"}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="font-medium text-gray-900 truncate"
              title={upload.name}
            >
              {upload.name}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatFileSize(upload.size)}</span>
              {upload.startTime && <span>• {getElapsedTime()}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(upload.status)}`}
          >
            {getStatusText(upload.status)}
          </span>

          {(upload.status === "completed" || upload.status === "error") && (
            <button
              onClick={() => onRemove(upload.id)}
              className="text-gray-400 hover:text-gray-600 transition"
              title="Remove"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {upload.status !== "completed" && upload.status !== "error" && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(upload.status)}`}
            style={{ width: `${upload.progress}%` }}
          />
        </div>
      )}

      {/* Error Message with Detailed Info */}
      {upload.status === "error" && upload.error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
          <div className="text-red-800 font-medium mb-1">Upload Failed</div>
          <div className="text-red-700">{upload.error}</div>

          {/* Common Solutions */}
          <div className="mt-2 text-red-600 text-xs">
            <details>
              <summary className="cursor-pointer hover:text-red-800">
                Common solutions...
              </summary>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Check R2 bucket CORS configuration</li>
                <li>Verify R2 credentials are correct</li>
                <li>Ensure S3 API endpoint is properly configured</li>
                <li>Check network connection</li>
              </ul>
            </details>
          </div>
        </div>
      )}

      {/* Success Message */}
      {upload.status === "completed" && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          ✅ File uploaded successfully
        </div>
      )}
    </div>
  );
}
