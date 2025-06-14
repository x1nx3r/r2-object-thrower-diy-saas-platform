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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {credentials.map((credential) => (
        <div
          key={credential.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-900">{credential.name}</h4>
            <button
              onClick={() => onDelete(credential.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <strong>Bucket:</strong> {credential.bucket}
            </p>
            <p>
              <strong>Access Key:</strong> {credential.accessKeyId?.slice(0, 8)}
              ...
            </p>
            <p>
              <strong>Added:</strong>{" "}
              {new Date(credential.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
