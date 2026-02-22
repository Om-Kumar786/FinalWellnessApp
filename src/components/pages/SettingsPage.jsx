export default function SettingsPage({ onLogout }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border">
      <h1 className="text-3xl font-semibold mb-6">
        Account Settings
      </h1>

      <div className="border p-6 rounded-lg">
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