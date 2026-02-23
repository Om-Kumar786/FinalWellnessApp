export default function SettingsPage({ onLogout }) {
  const username = localStorage.getItem("user") || "User";

  return (
    <div className="surface card p-8 space-y-6">

      <h1 className="text-3xl font-semibold text-[var(--text)]">
        Account Settings
      </h1>

      {/* Profile */}
      <div className="border border-[var(--border)] p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">
          Profile
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center bg-[var(--accent)] text-white text-xl rounded-full font-semibold">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-medium text-lg">{username}</p>
            <p className="text-sm text-muted">
              Active Wellness Member
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="border border-[var(--border)] p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">
          Logout
        </h2>

        <button
          onClick={onLogout}
          className="btn-danger px-6 py-2 rounded-lg hover:brightness-110 transition"
        >
          Logout
        </button>
      </div>

    </div>
  );
}
