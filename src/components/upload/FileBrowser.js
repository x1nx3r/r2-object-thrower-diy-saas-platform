"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { fetchFiles, deleteFile, getDownloadUrl } from "@/lib/api/files";

export default function FileBrowser({ onFileDeleted, refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesList = await fetchFiles();
      setFiles(filesList);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await deleteFile(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
      setSelectedFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      onFileDeleted?.(fileId);
      setContextMenu(null);
      setPreviewFile(null);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    }
  };

  const handleDownload = async (file) => {
    try {
      let downloadUrl;

      // Use public URL if available, otherwise get download URL
      if (file.publicUrl) {
        downloadUrl = file.publicUrl;
      } else {
        const response = await getDownloadUrl(file.id);
        downloadUrl = response.downloadUrl;
      }

      // Create temporary link and click it
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setContextMenu(null);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to generate download link. Please try again.");
    }
  };

  const handleCopyLink = async (file) => {
    try {
      let url;

      if (file.publicUrl) {
        url = file.publicUrl;
      } else {
        const response = await getDownloadUrl(file.id);
        url = response.downloadUrl;
      }

      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
      setContextMenu(null);
    } catch (error) {
      console.error("Error copying link:", error);
      alert("Failed to copy link. Please try again.");
    }
  };

  const handleRightClick = (event, file) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      file: file,
    });
  };

  const handlePreview = (file) => {
    if (isImageFile(file.type)) {
      setPreviewFile(file);
    }
    setContextMenu(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date.seconds * 1000).toLocaleDateString();
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎥";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📕";
    if (type.includes("doc")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    return "📄";
  };

  const isImageFile = (type) => type.startsWith("image/");
  const isVideoFile = (type) => type.startsWith("video/");

  // Filter and sort files
  const filteredFiles = files
    .filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.size - a.size;
        case "type":
          return a.type.localeCompare(b.type);
        case "date":
        default:
          return b.uploadedAt?.seconds - a.uploadedAt?.seconds;
      }
    });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">
            Your Files ({files.length})
          </h3>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded-l-lg transition ${
                  viewMode === "grid"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-r-lg transition ${
                  viewMode === "list"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>

        {/* Files Display */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "No files match your search"
                : "No files uploaded yet"}
            </h4>
            <p className="text-gray-600">
              {searchTerm
                ? "Try a different search term"
                : "Upload your first file to get started"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <FileGridItem
                key={file.id}
                file={file}
                onRightClick={handleRightClick}
                onPreview={handlePreview}
                isImageFile={isImageFile}
                isVideoFile={isVideoFile}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                onRightClick={handleRightClick}
                onPreview={handlePreview}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onDownload={() => handleDownload(contextMenu.file)}
          onCopyLink={() => handleCopyLink(contextMenu.file)}
          onPreview={() => handlePreview(contextMenu.file)}
          onDelete={() => handleDelete(contextMenu.file.id)}
          onClose={() => setContextMenu(null)}
          isImageFile={isImageFile}
        />
      )}

      {/* Image Preview Modal */}
      {previewFile && (
        <ImagePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={() => handleDownload(previewFile)}
          onDelete={() => handleDelete(previewFile.id)}
        />
      )}
    </>
  );
}

// Enhanced Grid Item with Next.js Image
function FileGridItem({
  file,
  onRightClick,
  onPreview,
  isImageFile,
  isVideoFile,
  getFileIcon,
  formatFileSize,
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow group cursor-pointer bg-white"
      onContextMenu={(e) => onRightClick(e, file)}
      onDoubleClick={() => onPreview(file)}
    >
      <div className="text-center mb-2">
        {isImageFile(file.type) && !imageError ? (
          <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
            <Image
              src={file.publicUrl || `/api/files/${file.id}/thumbnail`}
              alt={file.name}
              width={80}
              height={80}
              className="object-cover rounded"
              onError={() => setImageError(true)}
              unoptimized={file.publicUrl?.startsWith("http")} // Don't optimize external URLs
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyDjvZCGvs+y2iLqikZlMlOIpklOEn+ixGEfZaWwgfaWEcMoqIq4SJsJnEjg4FwYGCMsgqUa7HVqbhKFm1R7zyqHMh3KlbIlJjQRzBB1j8eMZjLpH5z3IXZyznFbTH8fq7waSUxMLGn5SJ9cKbdYQVcmrIZLu7LQE81qLSdyHOjxb0K5TUIJiN6M5KcO6e+7xNUVEEW8qEYqhsZ/9k="
            />
          </div>
        ) : isVideoFile(file.type) && !imageError ? (
          <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <video
              src={file.publicUrl}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="text-white text-lg">▶️</div>
            </div>
          </div>
        ) : (
          <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-4xl">{getFileIcon(file.type)}</div>
          </div>
        )}

        <p
          className="text-sm font-medium text-gray-900 truncate mt-2"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>

      {/* Quick Actions (visible on hover) */}
      <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isImageFile(file.type) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
            title="Preview"
          >
            👁️
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(file.publicUrl, "_blank");
          }}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
          title="Open"
        >
          🔗
        </button>
      </div>
    </div>
  );
}

// Enhanced List Item with Next.js Image
function FileListItem({
  file,
  onRightClick,
  onPreview,
  getFileIcon,
  formatFileSize,
  formatDate,
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      onContextMenu={(e) => onRightClick(e, file)}
      onDoubleClick={() => onPreview(file)}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Thumbnail/Icon */}
        <div className="w-10 h-10 flex-shrink-0">
          {file.type.startsWith("image/") && !imageError ? (
            <Image
              src={file.publicUrl || `/api/files/${file.id}/thumbnail`}
              alt={file.name}
              width={40}
              height={40}
              className="object-cover rounded"
              onError={() => setImageError(true)}
              unoptimized={file.publicUrl?.startsWith("http")}
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center text-2xl">
              {getFileIcon(file.type)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-sm text-gray-500">
            {formatFileSize(file.size)} • {formatDate(file.uploadedAt)} •{" "}
            {file.credentialName}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(file.publicUrl, "_blank");
          }}
          className="text-blue-600 hover:text-blue-800 p-1 transition"
          title="Open"
        >
          🔗
        </button>
      </div>
    </div>
  );
}

// Context Menu Component (unchanged)
function ContextMenu({
  x,
  y,
  file,
  onDownload,
  onCopyLink,
  onPreview,
  onDelete,
  onClose,
  isImageFile,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-48"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-1 border-b border-gray-100 mb-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">{file.type}</p>
      </div>

      {isImageFile(file.type) && (
        <button
          onClick={onPreview}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <span className="mr-2">👁️</span>
          Preview
        </button>
      )}

      <button
        onClick={() => window.open(file.publicUrl, "_blank")}
        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <span className="mr-2">🔗</span>
        Open in New Tab
      </button>

      <button
        onClick={onDownload}
        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <span className="mr-2">⬇️</span>
        Download
      </button>

      <button
        onClick={onCopyLink}
        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <span className="mr-2">📋</span>
        Copy Link
      </button>

      <div className="border-t border-gray-100 my-1"></div>

      <button
        onClick={onDelete}
        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
      >
        <span className="mr-2">🗑️</span>
        Delete
      </button>
    </div>
  );
}

// Enhanced Image Preview Modal with Next.js Image
function ImagePreviewModal({ file, onClose, onDownload, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{file.name}</h3>
            <p className="text-sm text-gray-500">{file.type}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onDownload}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
            >
              Download
            </button>
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="p-4 flex justify-center">
          <div className="relative max-w-full max-h-96">
            <Image
              src={file.publicUrl}
              alt={file.name}
              width={800}
              height={600}
              className="object-contain"
              unoptimized={file.publicUrl?.startsWith("http")}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
