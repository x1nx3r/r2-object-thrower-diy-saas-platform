"use client";

export default function DashboardHeader({ user, userProfile, onLogout }) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900">DIY R2 Thrower</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-gray-700">
                {userProfile?.displayName || user.email}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
