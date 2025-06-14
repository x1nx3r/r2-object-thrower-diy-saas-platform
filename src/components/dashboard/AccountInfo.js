"use client";

export default function AccountInfo({ user, userProfile }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Account Information
      </h3>
      <div className="space-y-2 text-gray-600">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>User ID:</strong> {user.uid}
        </p>
        <p>
          <strong>Member since:</strong>{" "}
          {userProfile?.createdAt
            ? new Date(
                userProfile.createdAt.seconds * 1000,
              ).toLocaleDateString()
            : "Today"}
        </p>
        <p>
          <strong>Last login:</strong>{" "}
          {userProfile?.lastLogin
            ? new Date(userProfile.lastLogin.seconds * 1000).toLocaleString()
            : "Now"}
        </p>
      </div>
    </div>
  );
}
