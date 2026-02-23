export default function SettingsPage({ onLogout }) {
  const username = localStorage.getItem("user") || "User";

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">

      <h1 className="text-3xl font-semibold text-gray-900">
        Account Settings
      </h1>

      {/* Profile */}
      <div className="border border-gray-200 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">
          Profile
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center bg-indigo-500 text-white text-xl rounded-full font-semibold">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-medium text-lg">{username}</p>
            <p className="text-sm text-gray-500">
              Active Wellness Member
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="border border-gray-200 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">
          Logout
        </h2>

        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

    </div>
  );
}