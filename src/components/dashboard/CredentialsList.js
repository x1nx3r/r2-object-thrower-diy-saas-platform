"use client";

export default function CredentialsList({
  credentials,
  loading,
  onDelete,
  onAddNew,
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading credentials...</p>
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">🔑</div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          No R2 Credentials Yet
        </h4>
        <p className="text-gray-600 mb-4">
          Add your first R2 credentials to start uploading files.
        </p>
        <button
          onClick={onAddNew}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Add R2 Account
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {credentials.map((credential) => (
        <CredentialCard
          key={credential.id}
          credential={credential}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// Individual credential card component
function CredentialCard({ credential, onDelete }) {
  // Check if credential needs migration
  const needsMigration = credential.endpoint && !credential.s3Endpoint;
  const hasPublicDomain = credential.publicDomain;
  const s3Endpoint = credential.s3Endpoint || credential.endpoint;

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">
            {credential.name}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Added {new Date(credential.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => onDelete(credential.id)}
          className="text-red-500 hover:text-red-700 text-sm font-medium transition"
          title="Delete credential"
        >
          Delete
        </button>
      </div>

      {/* Migration Warning */}
      {needsMigration && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-yellow-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-yellow-800 font-medium">
              Needs Update
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            This credential uses the old format and may cause upload issues.
          </p>
        </div>
      )}

      {/* Credential Details */}
      <div className="space-y-3">
        {/* Bucket Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Bucket</span>
            <span className="text-sm text-gray-900 font-mono">
              {credential.bucket}
            </span>
          </div>
        </div>

        {/* Access Key */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Access Key
            </span>
            <span className="text-sm text-gray-600 font-mono">
              {credential.accessKeyId?.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* S3 Endpoint */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-700">S3 API</span>
              <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                Uploads
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-600 font-mono mt-1 break-all">
            {s3Endpoint ? new URL(s3Endpoint).hostname : "Not configured"}
          </p>
        </div>

        {/* Public Domain */}
        {hasPublicDomain ? (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-700">
                  Public Domain
                </span>
                <span className="ml-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                  Downloads
                </span>
              </div>
            </div>
            <p className="text-xs text-green-600 font-mono mt-1 break-all">
              {new URL(credential.publicDomain).hostname}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Public Domain
              </span>
              <span className="text-xs text-gray-400">Private bucket</span>
            </div>
          </div>
        )}

        {/* Configuration Status */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Configuration</span>
            <div className="flex items-center space-x-2">
              {/* Upload Status */}
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-1 ${
                    s3Endpoint && !needsMigration
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-600">Upload</span>
              </div>

              {/* Download Status */}
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-1 ${
                    hasPublicDomain || s3Endpoint
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-600">Download</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Upload Ready Indicator */}
            {s3Endpoint && !needsMigration ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Ready
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Needs Setup
              </span>
            )}
          </div>

          {/* Test Connection Button */}
          <button
            onClick={() => testConnection(credential)}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium transition"
            disabled={needsMigration}
          >
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to test connection (placeholder)
function testConnection(credential) {
  // This could make a test API call to verify the credentials work
  console.log("Testing connection for:", credential.name);

  // For now, just show an alert
  if (credential.s3Endpoint && !credential.endpoint) {
    alert(
      `Connection test for "${credential.name}" - credentials look properly configured!`,
    );
  } else {
    alert(
      `Connection test for "${credential.name}" - please update your credentials to use the new format.`,
    );
  }
}
