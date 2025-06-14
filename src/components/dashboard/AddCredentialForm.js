"use client";

import { useState } from "react";

export default function AddCredentialForm({ onSubmit, onCancel, isLoading }) {
  const [credential, setCredential] = useState({
    name: "",
    accessKeyId: "",
    secretAccessKey: "",
    endpoint: "",
    bucket: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(credential);
    // Reset form
    setCredential({
      name: "",
      accessKeyId: "",
      secretAccessKey: "",
      endpoint: "",
      bucket: "",
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Add New R2 Credentials
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            R2 Endpoint
          </label>
          <input
            type="url"
            value={credential.endpoint}
            onChange={(e) =>
              setCredential({ ...credential, endpoint: e.target.value })
            }
            placeholder="https://your-account-id.r2.cloudflarestorage.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
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
