"use client";

export default function UserStats({
  userProfile,
  credentialsCount,
  credentialsLoading,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome to your Dashboard! 🎉
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Plan</h3>
          <p className="text-2xl font-bold text-purple-600 capitalize">
            {userProfile?.plan || "Free"}
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Total Uploads
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {userProfile?.totalUploads || 0}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            R2 Accounts
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {credentialsLoading ? "..." : credentialsCount}
          </p>
        </div>
      </div>
    </div>
  );
}
