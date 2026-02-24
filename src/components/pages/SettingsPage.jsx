const reminderItems = [
  { key: "mood", label: "Mood reminder" },
  { key: "sleep", label: "Sleep reminder" },
  { key: "steps", label: "Steps reminder" },
  { key: "mindfulness", label: "Mindfulness reminder" },
];

const parseUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const permissionLabel = {
  granted: "Enabled",
  denied: "Blocked",
  default: "Not set",
  unsupported: "Not supported",
};

export default function SettingsPage({
  onLogout,
  currentUser,
  reminders,
  notificationPermission,
  onRequestNotificationPermission,
  onReminderMasterChange,
  onReminderItemChange,
}) {
  const username = currentUser?.username || localStorage.getItem("user") || "User";
  const role = currentUser?.role || "user";
  const isAdmin = role === "admin";
  const users = parseUsers();

  return (
    <div className="surface card space-y-6 p-8">
      <h1 className="text-3xl font-semibold text-[var(--text)]">Account Settings</h1>

      <div className="rounded-lg border border-[var(--border)] p-6">
        <h2 className="mb-3 text-lg font-semibold">Profile</h2>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-xl font-semibold text-white">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-lg font-medium">{username}</p>
            <p className="text-sm text-muted">
              {isAdmin ? "Administrator" : "Active Wellness Member"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Daily Reminders</h2>
            <p className="text-sm text-muted">
              Browser notification status: {permissionLabel[notificationPermission] || "Unknown"}
            </p>
          </div>

          <button
            type="button"
            onClick={onRequestNotificationPermission}
            className="btn-ghost rounded-lg px-4 py-2 text-sm hover:bg-[var(--surface-2)]"
          >
            Enable Notifications
          </button>
        </div>

        <label className="mb-4 flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
          <input
            type="checkbox"
            checked={Boolean(reminders?.enabled)}
            onChange={(e) => onReminderMasterChange(e.target.checked)}
          />
          <span className="text-sm">Turn on daily reminders</span>
        </label>

        <div className="space-y-3">
          {reminderItems.map((item) => (
            <div
              key={item.key}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 md:grid-cols-[1fr_auto]"
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(reminders?.[item.key]?.enabled)}
                  onChange={(e) =>
                    onReminderItemChange(item.key, { enabled: e.target.checked })
                  }
                />
                <span className="text-sm">{item.label}</span>
              </label>

              <input
                type="time"
                value={reminders?.[item.key]?.time || "09:00"}
                onChange={(e) => onReminderItemChange(item.key, { time: e.target.value })}
                className="input rounded-lg px-3 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="mb-3 text-lg font-semibold">Admin Portal Access</h2>
          <p className="mb-4 text-sm text-muted">Total users currently using Pulse: {users.length}</p>

          <div className="max-h-48 space-y-2 overflow-auto rounded-lg border border-[var(--border)] p-3">
            {users.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm"
              >
                <span>{user.username}</span>
                <span className="text-xs uppercase text-muted">{user.role || "user"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="mb-2 text-lg font-semibold">Admin Metrics</h2>
          <p className="text-sm text-muted">
            Only admins can view user analytics and management information.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] p-6">
        <h2 className="mb-3 text-lg font-semibold">Logout</h2>

        <button
          onClick={onLogout}
          className="btn-danger rounded-lg px-6 py-2 transition hover:brightness-110"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
