"use client";

import { useState } from "react";

export default function CredentialMigrationHelper({ credentials, onMigrate }) {
  const [migrating, setMigrating] = useState(false);

  // Check if any credentials need migration (have 'endpoint' but no 's3Endpoint')
  const needsMigration = credentials.some(
    (cred) =>
      cred.endpoint &&
      !cred.s3Endpoint &&
      (cred.endpoint.includes("r2.cloudflarestorage.com") ||
        !cred.endpoint.includes("r2.cloudflarestorage.com")),
  );

  const handleMigrate = async () => {
    if (!needsMigration) return;

    setMigrating(true);

    const migratedCredentials = credentials.map((cred) => {
      if (cred.endpoint && !cred.s3Endpoint) {
        // If endpoint looks like a custom domain, move it to publicDomain
        if (!cred.endpoint.includes("r2.cloudflarestorage.com")) {
          return {
            ...cred,
            publicDomain: cred.endpoint,
            s3Endpoint: "", // User will need to fill this
            endpoint: undefined, // Remove old field
          };
        } else {
          // If it's already an S3 endpoint, just rename the field
          return {
            ...cred,
            s3Endpoint: cred.endpoint,
            endpoint: undefined, // Remove old field
          };
        }
      }
      return cred;
    });

    await onMigrate(migratedCredentials);
    setMigrating(false);
  };

  if (!needsMigration) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Credential Update Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your R2 credentials need to be updated to separate S3 API
              endpoints from public domains. This will fix upload issues and
              improve functionality.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {migrating ? "Updating..." : "Update Credentials"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
