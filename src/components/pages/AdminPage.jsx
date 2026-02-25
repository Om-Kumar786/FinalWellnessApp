import { useMemo, useState } from "react";

const DEFAULT_CONFIG = {
  defaultReminders: {
    enabled: true,
    mood: { enabled: true, time: "09:00" },
    sleep: { enabled: true, time: "21:00" },
    steps: { enabled: true, time: "18:00" },
    mindfulness: { enabled: true, time: "20:00" },
  },
  goalTemplates: [
    "Walk 10,000 steps daily",
    "Sleep 8 hours every night",
    "Drink 3L of water",
    "Meditate for 15 minutes",
    "Reduce screen time",
  ],
  mindfulnessResources: [
    "5-minute breathing session",
    "Body scan before bedtime",
    "Screen-free wind-down routine",
  ],
};

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeUsers = (users) =>
  (Array.isArray(users) ? users : []).map((user) => ({
    ...user,
    active: user.active !== false,
    role: user.role || "user",
  }));

const getWellnessByUser = (username) =>
  parseJSON(localStorage.getItem(`wellnessData_${username}`), {
    moodHistory: [],
    sleepHistory: [],
    goals: [],
    sleepHours: 0,
    steps: 0,
    stressLevel: "Low",
  });

export default function AdminPage({ currentUser }) {
  const isAdmin = (currentUser?.role || "user") === "admin";
  const actor = currentUser?.username || "admin";

  const [users, setUsers] = useState(() =>
    normalizeUsers(parseJSON(localStorage.getItem("users"), [])),
  );
  const [config, setConfig] = useState(() =>
    ({
      ...DEFAULT_CONFIG,
      ...parseJSON(localStorage.getItem("adminConfig"), {}),
      defaultReminders: {
        ...DEFAULT_CONFIG.defaultReminders,
        ...parseJSON(localStorage.getItem("adminConfig"), {})?.defaultReminders,
      },
    }),
  );
  const [auditLogs, setAuditLogs] = useState(() =>
    parseJSON(localStorage.getItem("adminAuditLogs"), []),
  );
  const [backupCheckedAt, setBackupCheckedAt] = useState(() =>
    localStorage.getItem("adminBackupCheckedAt") || "Never",
  );
  const [reviewedFlags, setReviewedFlags] = useState({});

  const userSummaries = useMemo(() => {
    return users.map((user) => {
      const wellness = getWellnessByUser(user.username);
      const moodHistory = wellness.moodHistory || [];
      const sleepHistory = wellness.sleepHistory || [];
      const goals = wellness.goals || [];
      const completedGoals = goals.filter((goal) => goal.completed).length;
      const avgSleep =
        sleepHistory.length > 0
          ? sleepHistory.reduce((sum, day) => sum + Number(day.hours || 0), 0) / sleepHistory.length
          : 0;

      return {
        username: user.username,
        active: user.active !== false,
        role: user.role,
        sleepHours: Number(wellness.sleepHours || 0),
        steps: Number(wellness.steps || 0),
        stressLevel: wellness.stressLevel || "Low",
        moodHistory,
        sleepHistory,
        goals,
        completedGoals,
        avgSleep,
      };
    });
  }, [users]);

  const totals = useMemo(() => {
    const activeUsers = userSummaries.filter((user) => user.active).length;
    const engagedUsers = userSummaries.filter(
      (user) => user.moodHistory.length > 0 || user.sleepHistory.length > 0 || user.goals.length > 0,
    ).length;
    const totalGoals = userSummaries.reduce((sum, user) => sum + user.goals.length, 0);
    const completedGoals = userSummaries.reduce((sum, user) => sum + user.completedGoals, 0);
    const goalSuccessRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const sleepUsers = userSummaries.filter((user) => user.sleepHours > 0);
    const avgSleep =
      sleepUsers.length > 0
        ? sleepUsers.reduce((sum, user) => sum + user.sleepHours, 0) / sleepUsers.length
        : 0;

    const stepUsers = userSummaries.filter((user) => user.steps > 0);
    const avgSteps =
      stepUsers.length > 0
        ? Math.round(stepUsers.reduce((sum, user) => sum + user.steps, 0) / stepUsers.length)
        : 0;

    return {
      activeUsers,
      engagedUsers,
      goalSuccessRate,
      avgSleep,
      avgSteps,
    };
  }, [userSummaries]);

  const moodDistribution = useMemo(() => {
    const map = {};
    userSummaries.forEach((user) => {
      user.moodHistory.forEach((entry) => {
        map[entry.mood] = (map[entry.mood] || 0) + 1;
      });
    });
    return map;
  }, [userSummaries]);

  const moderationFlags = useMemo(() => {
    const flags = [];
    userSummaries.forEach((user) => {
      const reasons = [];
      const stressedDays = user.moodHistory.filter((entry) => entry.mood === "Stressed").length;
      const stressedRatio =
        user.moodHistory.length > 0 ? stressedDays / user.moodHistory.length : 0;

      if (user.sleepHours > 0 && user.sleepHours < 5) {
        reasons.push("Very low sleep in latest log");
      }
      if (user.avgSleep > 0 && user.avgSleep < 6) {
        reasons.push("Weekly average sleep below 6h");
      }
      if (stressedRatio >= 0.6 && user.moodHistory.length >= 3) {
        reasons.push("Frequent stressed mood trend");
      }
      if (String(user.stressLevel).toLowerCase() === "high") {
        reasons.push("Stress level set to high");
      }

      if (reasons.length > 0) {
        flags.push({
          id: `${user.username}-${reasons.join("-")}`,
          username: user.username,
          reasons,
        });
      }
    });
    return flags;
  }, [userSummaries]);

  const healthStats = useMemo(() => {
    const reminderFailures = parseJSON(localStorage.getItem("reminderFailures"), {});
    const reminderSettingsUsers = users.filter((user) =>
      Boolean(parseJSON(localStorage.getItem(`reminderSettings_${user.username}`), null)?.enabled),
    ).length;
    const notificationEnabledUsers = users.filter(
      (user) => localStorage.getItem(`notificationPermission_${user.username}`) === "granted",
    ).length;
    const failureCount = Object.values(reminderFailures).reduce((sum, entries) => {
      return sum + (Array.isArray(entries) ? entries.length : 0);
    }, 0);

    return {
      reminderSettingsUsers,
      notificationEnabledUsers,
      failureCount,
    };
  }, [users]);

  const persistUsers = (nextUsers) => {
    localStorage.setItem("users", JSON.stringify(nextUsers));
    setUsers(nextUsers);
  };

  const pushAudit = (action, target) => {
    const nextLogs = [
      {
        id: `${action}-${target}-${auditLogs.length + 1}`,
        actor,
        action,
        target,
        at: new Date().toLocaleString(),
      },
      ...auditLogs,
    ].slice(0, 120);
    setAuditLogs(nextLogs);
    localStorage.setItem("adminAuditLogs", JSON.stringify(nextLogs));
  };

  const updateUserStatus = (username) => {
    const nextUsers = users.map((user) => {
      if (user.username !== username) return user;
      return { ...user, active: user.active === false };
    });
    persistUsers(nextUsers);
    pushAudit("toggle_user_status", username);
  };

  const updateUserRole = (username, role) => {
    const adminCount = users.filter((user) => user.role === "admin").length;
    const targetUser = users.find((user) => user.username === username);

    if (targetUser?.role === "admin" && role !== "admin" && adminCount <= 1) {
      alert("At least one admin account must remain.");
      return;
    }

    const nextUsers = users.map((user) => (user.username === username ? { ...user, role } : user));
    persistUsers(nextUsers);
    pushAudit("change_user_role", `${username} -> ${role}`);
  };

  const resetPassword = (username) => {
    const newPassword = window.prompt(`Set new password for ${username}`, "welcome123");
    if (!newPassword) return;

    const nextUsers = users.map((user) =>
      user.username === username ? { ...user, password: newPassword } : user,
    );
    persistUsers(nextUsers);
    pushAudit("reset_password", username);
  };

  const updateReminderConfig = (key, patch) => {
    setConfig((prev) => ({
      ...prev,
      defaultReminders: {
        ...prev.defaultReminders,
        [key]:
          typeof prev.defaultReminders[key] === "object"
            ? { ...prev.defaultReminders[key], ...patch }
            : patch,
      },
    }));
  };

  const saveConfig = () => {
    localStorage.setItem("adminConfig", JSON.stringify(config));
    pushAudit("save_admin_config", "adminConfig");
  };

  const runBackupCheck = () => {
    const stamp = new Date().toLocaleString();
    setBackupCheckedAt(stamp);
    localStorage.setItem("adminBackupCheckedAt", stamp);
    pushAudit("backup_check", stamp);
  };

  const exportSnapshot = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      users,
      adminConfig: config,
      auditLogs,
      totals,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pulse-admin-snapshot.json";
    a.click();
    URL.revokeObjectURL(url);
    pushAudit("export_snapshot", "pulse-admin-snapshot.json");
  };

  if (!isAdmin) {
    return (
      <div className="surface card p-8">
        <h1 className="text-2xl font-semibold">Admin Access Required</h1>
        <p className="mt-2 text-sm text-muted">Only admin accounts can access this section.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <h1 className="text-3xl font-semibold">Admin Control Center</h1>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Total Users" value={users.length} />
        <MetricCard label="Active Users" value={totals.activeUsers} />
        <MetricCard label="Engaged Users" value={totals.engagedUsers} />
        <MetricCard label="Avg Sleep" value={`${totals.avgSleep.toFixed(1)}h`} />
        <MetricCard label="Goal Success" value={`${totals.goalSuccessRate}%`} />
      </section>

      <section className="surface card p-6">
        <h2 className="mb-4 text-xl font-semibold">User Management</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.username}
              className="grid gap-3 rounded-xl border border-[var(--border)] p-3 md:grid-cols-[1.2fr_auto_auto_auto_auto]"
            >
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-muted">
                  {user.active !== false ? "Active" : "Deactivated"} • {user.role}
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateUserStatus(user.username)}
                className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--surface-2)]"
              >
                {user.active !== false ? "Deactivate" : "Activate"}
              </button>

              <button
                type="button"
                onClick={() => updateUserRole(user.username, user.role === "admin" ? "user" : "admin")}
                className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--surface-2)]"
              >
                Set {user.role === "admin" ? "User" : "Admin"}
              </button>

              <button
                type="button"
                onClick={() => resetPassword(user.username)}
                className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--surface-2)]"
              >
                Reset Password
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="surface card space-y-4 p-6">
        <h2 className="text-xl font-semibold">Content and Configuration</h2>

        <div className="rounded-xl border border-[var(--border)] p-4">
          <p className="mb-3 text-sm font-medium text-muted">Default Reminder Schedule</p>
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(config.defaultReminders.enabled)}
              onChange={(e) => updateReminderConfig("enabled", e.target.checked)}
            />
            Master reminders enabled by default
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            {["mood", "sleep", "steps", "mindfulness"].map((key) => (
              <div key={key} className="rounded-lg border border-[var(--border)] p-3">
                <p className="mb-2 text-sm capitalize">{key} reminder</p>
                <label className="mb-2 flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={Boolean(config.defaultReminders[key]?.enabled)}
                    onChange={(e) => updateReminderConfig(key, { enabled: e.target.checked })}
                  />
                  Enabled
                </label>
                <input
                  type="time"
                  value={config.defaultReminders[key]?.time || "09:00"}
                  onChange={(e) => updateReminderConfig(key, { time: e.target.value })}
                  className="input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] p-4">
          <p className="mb-2 text-sm font-medium text-muted">Goal Templates (one per line)</p>
          <textarea
            value={config.goalTemplates.join("\n")}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                goalTemplates: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              }))
            }
            className="input min-h-28 w-full rounded-lg p-3 text-sm"
          />
        </div>

        <div className="rounded-xl border border-[var(--border)] p-4">
          <p className="mb-2 text-sm font-medium text-muted">Mindfulness Resources (one per line)</p>
          <textarea
            value={config.mindfulnessResources.join("\n")}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                mindfulnessResources: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              }))
            }
            className="input min-h-24 w-full rounded-lg p-3 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={saveConfig}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Save Admin Config
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface card p-6">
          <h2 className="mb-4 text-xl font-semibold">Anonymized Trends</h2>
          <p className="text-sm text-muted">Average steps: {totals.avgSteps}</p>
          <p className="text-sm text-muted">Average sleep: {totals.avgSleep.toFixed(1)}h</p>
          <div className="mt-3 space-y-2">
            {Object.keys(moodDistribution).length === 0 ? (
              <p className="text-sm text-muted">No mood data yet.</p>
            ) : (
              Object.entries(moodDistribution).map(([mood, count]) => (
                <p key={mood} className="rounded-lg accent-soft p-2 text-sm">
                  {mood}: {count} logs
                </p>
              ))
            )}
          </div>
        </div>

        <div className="surface card p-6">
          <h2 className="mb-4 text-xl font-semibold">Safety Moderation Queue</h2>
          {moderationFlags.length === 0 ? (
            <p className="text-sm text-muted">No high-risk users flagged right now.</p>
          ) : (
            <div className="space-y-3">
              {moderationFlags.map((flag) => (
                <div key={flag.id} className="rounded-lg border border-[var(--border)] p-3">
                  <p className="font-medium">{flag.username}</p>
                  <p className="mt-1 text-sm text-muted">{flag.reasons.join(" | ")}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setReviewedFlags((prev) => ({
                        ...prev,
                        [flag.id]: true,
                      }))
                    }
                    className="mt-2 rounded-lg border border-[var(--border)] px-3 py-1 text-xs"
                  >
                    {reviewedFlags[flag.id] ? "Reviewed" : "Mark Reviewed"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface card p-6">
          <h2 className="mb-4 text-xl font-semibold">System Health</h2>
          <p className="text-sm text-muted">
            Users with reminders enabled: {healthStats.reminderSettingsUsers}
          </p>
          <p className="text-sm text-muted">
            Users with browser notifications enabled: {healthStats.notificationEnabledUsers}
          </p>
          <p className="text-sm text-muted">Reminder failure logs: {healthStats.failureCount}</p>
          <p className="mt-2 text-xs text-muted">Last backup check: {backupCheckedAt}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runBackupCheck}
              className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--surface-2)]"
            >
              Run Backup Check
            </button>
            <button
              type="button"
              onClick={exportSnapshot}
              className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm hover:bg-[var(--surface-2)]"
            >
              Export Snapshot
            </button>
          </div>
        </div>

        <div className="surface card p-6">
          <h2 className="mb-4 text-xl font-semibold">Audit Trail</h2>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted">No admin actions logged yet.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-[var(--border)] p-2 text-xs">
                  <p className="font-semibold">
                    {log.action} | {log.target}
                  </p>
                  <p className="text-muted">
                    {log.actor} | {log.at}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="surface card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
