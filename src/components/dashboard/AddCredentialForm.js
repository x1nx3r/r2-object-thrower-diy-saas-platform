"use client";

import { useState, useEffect } from "react";

export default function AddCredentialForm({ onSubmit, onCancel, isLoading }) {
  const [credential, setCredential] = useState({
    name: "",
    accessKeyId: "",
    secretAccessKey: "",
    s3Endpoint: "",
    publicDomain: "",
    bucket: "",
    publicAccess: "development", // development, custom
  });

  const [validation, setValidation] = useState({});

  // Validation function for S3 endpoint
  const validateS3Endpoint = (endpoint, bucket) => {
    if (!endpoint) return { valid: true, message: "" };

    try {
      const url = new URL(endpoint);

      // Check if endpoint ends with bucket name (common mistake)
      if (bucket && endpoint.endsWith(`/${bucket}`)) {
        return {
          valid: false,
          message: `S3 endpoint should not include the bucket name. Remove "/${bucket}" from the end.`,
          suggested: endpoint.replace(`/${bucket}`, ""),
        };
      }

      // Check if it looks like an R2 endpoint
      if (!url.hostname.includes("r2.cloudflarestorage.com")) {
        return {
          valid: false,
          message:
            "This doesn't look like an R2 S3 endpoint. It should end with 'r2.cloudflarestorage.com'",
        };
      }

      return { valid: true, message: "" };
    } catch (error) {
      return {
        valid: false,
        message: "Invalid URL format",
      };
    }
  };

  // Validation for development URL
  const validateDevUrl = (url) => {
    if (!url) return { valid: true, message: "" };

    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes("r2.dev")) {
        return {
          valid: false,
          message: "Development URL should be a pub-*.r2.dev domain",
        };
      }
      return { valid: true, message: "" };
    } catch (error) {
      return {
        valid: false,
        message: "Invalid URL format",
      };
    }
  };

  // Update validation when fields change
  useEffect(() => {
    const s3Result = validateS3Endpoint(
      credential.s3Endpoint,
      credential.bucket,
    );
    const devUrlResult =
      credential.publicAccess === "development"
        ? validateDevUrl(credential.publicDomain)
        : { valid: true, message: "" };

    setValidation({
      s3Endpoint: s3Result,
      devUrl: devUrlResult,
    });
  }, [
    credential.s3Endpoint,
    credential.bucket,
    credential.publicDomain,
    credential.publicAccess,
  ]);

  // Generate R2 development URL helper
  const generateR2DevUrl = (s3Endpoint) => {
    if (!s3Endpoint) return null;

    try {
      const match = s3Endpoint.match(
        /https:\/\/([a-f0-9]+)\.r2\.cloudflarestorage\.com/,
      );
      if (match) {
        const accountId = match[1];
        return `https://pub-${accountId}.r2.dev`;
      }
    } catch (error) {
      console.error("Error generating R2 dev URL:", error);
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(credential);

    // Reset form
    setCredential({
      name: "",
      accessKeyId: "",
      secretAccessKey: "",
      s3Endpoint: "",
      publicDomain: "",
      bucket: "",
      publicAccess: "development",
    });
  };

  const handlePublicAccessChange = (newAccess) => {
    const newCredential = {
      ...credential,
      publicAccess: newAccess,
    };

    // Auto-fill development URL if switching to development and we can generate it
    if (newAccess === "development" && credential.s3Endpoint) {
      const suggestedUrl = generateR2DevUrl(credential.s3Endpoint);
      if (suggestedUrl) {
        newCredential.publicDomain = suggestedUrl;
      }
    }

    setCredential(newCredential);
  };

  const handleAutoFillDevUrl = () => {
    const suggestedUrl = generateR2DevUrl(credential.s3Endpoint);
    if (suggestedUrl) {
      setCredential((prev) => ({ ...prev, publicDomain: suggestedUrl }));
    }
  };

  // Get the suggested development URL
  const suggestedDevUrl = generateR2DevUrl(credential.s3Endpoint);

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Add New R2 Credentials
      </h4>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={credential.name}
              onChange={(e) =>
                setCredential({ ...credential, name: e.target.value })
              }
              placeholder="My R2 Account"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bucket Name
            </label>
            <input
              type="text"
              value={credential.bucket}
              onChange={(e) =>
                setCredential({ ...credential, bucket: e.target.value })
              }
              placeholder="my-bucket"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* S3 Endpoint */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            R2 S3 API Endpoint
          </label>
          <input
            type="url"
            value={credential.s3Endpoint}
            onChange={(e) =>
              setCredential({ ...credential, s3Endpoint: e.target.value })
            }
            placeholder="https://your-account-id.r2.cloudflarestorage.com"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              validation.s3Endpoint?.valid === false
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            required
          />

          {/* S3 Endpoint Validation */}
          {validation.s3Endpoint?.valid === false && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                <div className="font-medium">
                  ❌ {validation.s3Endpoint.message}
                </div>
                {validation.s3Endpoint.suggested && (
                  <div className="mt-2">
                    <div className="text-xs text-red-600 mb-1">
                      Suggested correction:
                    </div>
                    <div className="bg-white p-2 rounded border text-xs font-mono text-green-700">
                      {validation.s3Endpoint.suggested}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCredential({
                          ...credential,
                          s3Endpoint: validation.s3Endpoint.suggested,
                        })
                      }
                      className="mt-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Use This
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {validation.s3Endpoint?.valid === true && credential.s3Endpoint && (
            <div className="mt-1 text-xs text-green-600">
              ✅ S3 endpoint format looks correct
            </div>
          )}

          <p className="text-xs text-gray-500 mt-1">
            Use the S3 API endpoint from your Cloudflare R2 dashboard.
            <strong>Do not include the bucket name</strong> in the endpoint.
          </p>
        </div>

        {/* Public Access Configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Public Access Configuration
          </label>

          <div className="space-y-3">
            {/* Development Option */}
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="access-development"
                name="publicAccess"
                value="development"
                checked={credential.publicAccess === "development"}
                onChange={(e) => handlePublicAccessChange(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="access-development"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  🌐 R2 Development URL (pub-*.r2.dev)
                </label>
                <p className="text-xs text-gray-500">
                  Files publicly accessible via Cloudflare-managed development
                  URLs. Perfect for getting started!
                </p>
              </div>
            </div>

            {/* Custom Domain Option */}
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="access-custom"
                name="publicAccess"
                value="custom"
                checked={credential.publicAccess === "custom"}
                onChange={(e) => handlePublicAccessChange(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="access-custom"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  🏷️ Custom Domain
                </label>
                <p className="text-xs text-gray-500">
                  Files accessible via your own custom domain (for production
                  use)
                </p>
              </div>
            </div>
          </div>

          {/* Development URL Input */}
          {credential.publicAccess === "development" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                R2 Development URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={credential.publicDomain}
                  onChange={(e) =>
                    setCredential({
                      ...credential,
                      publicDomain: e.target.value,
                    })
                  }
                  placeholder="https://pub-account-id.r2.dev"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    validation.devUrl?.valid === false
                      ? "border-red-300 bg-red-50"
                      : "border-blue-300"
                  }`}
                  required
                />
                {suggestedDevUrl &&
                  suggestedDevUrl !== credential.publicDomain && (
                    <button
                      type="button"
                      onClick={handleAutoFillDevUrl}
                      className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                      title="Auto-fill from S3 endpoint"
                    >
                      Auto-fill
                    </button>
                  )}
              </div>

              {/* Development URL Validation */}
              {validation.devUrl?.valid === false && (
                <div className="mt-2 text-sm text-red-600">
                  ❌ {validation.devUrl.message}
                </div>
              )}

              {validation.devUrl?.valid === true && credential.publicDomain && (
                <div className="mt-1 text-xs text-green-600">
                  ✅ Development URL format looks correct
                </div>
              )}

              {suggestedDevUrl && (
                <div className="mt-2 text-xs text-blue-700">
                  💡 <strong>Suggested URL:</strong>{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    {suggestedDevUrl}
                  </code>
                </div>
              )}

              <p className="text-xs text-blue-600 mt-2">
                Find this URL in your R2 bucket settings under "Public access" →
                "Public bucket URL"
              </p>
            </div>
          )}

          {/* Custom Domain Input */}
          {credential.publicAccess === "custom" && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Custom Domain URL
              </label>
              <input
                type="url"
                value={credential.publicDomain}
                onChange={(e) =>
                  setCredential({ ...credential, publicDomain: e.target.value })
                }
                placeholder="https://cdn.yourdomain.com"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
              />
              <p className="text-xs text-purple-600 mt-2">
                Enter your custom domain configured for this R2 bucket in
                Cloudflare
              </p>
            </div>
          )}
        </div>

        {/* API Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Key ID
            </label>
            <input
              type="text"
              value={credential.accessKeyId}
              onChange={(e) =>
                setCredential({ ...credential, accessKeyId: e.target.value })
              }
              placeholder="Your R2 Access Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Access Key
            </label>
            <input
              type="password"
              value={credential.secretAccessKey}
              onChange={(e) =>
                setCredential({
                  ...credential,
                  secretAccessKey: e.target.value,
                })
              }
              placeholder="Your R2 Secret Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-orange-900 mb-3">
            🚀 Quick Setup Guide:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h6 className="text-xs font-semibold text-orange-800 mb-1">
                1. R2 Bucket Setup:
              </h6>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• Go to Cloudflare R2 dashboard</li>
                <li>• Select your bucket</li>
                <li>• Enable "Public access" in Settings</li>
                <li>• Copy the "Public bucket URL"</li>
              </ul>
            </div>
            <div>
              <h6 className="text-xs font-semibold text-orange-800 mb-1">
                2. API Credentials:
              </h6>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• Go to "Manage R2 API tokens"</li>
                <li>• Create new API token</li>
                <li>• Copy Access Key ID and Secret</li>
                <li>• Copy S3 API endpoint</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary Preview */}
        {credential.name &&
          credential.bucket &&
          credential.s3Endpoint &&
          credential.publicDomain && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-900 mb-2">
                📋 Configuration Summary:
              </h5>
              <div className="text-xs text-green-800 space-y-1">
                <div>
                  <strong>Account:</strong> {credential.name}
                </div>
                <div>
                  <strong>Bucket:</strong> {credential.bucket}
                </div>
                <div>
                  <strong>Upload via:</strong> {credential.s3Endpoint}
                </div>
                <div>
                  <strong>Download via:</strong> {credential.publicDomain}
                </div>
                <div>
                  <strong>Access type:</strong>
                  {credential.publicAccess === "development"
                    ? " Development (pub-*.r2.dev)"
                    : " Custom Domain"}
                </div>
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={
              isLoading ||
              validation.s3Endpoint?.valid === false ||
              validation.devUrl?.valid === false
            }
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {isLoading ? "Adding..." : "Add Credentials"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
