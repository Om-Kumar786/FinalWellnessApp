import {
  Activity,
  Brain,
  Heart,
  LayoutDashboard,
  Moon,
  Settings,
  Target,
} from "lucide-react";

export default function NavigationSidebar({ activeTab, onTabChange, currentUser }) {
  const username = currentUser?.username || localStorage.getItem("user") || "User";
  const role = currentUser?.role || "user";
  const isAdmin = role === "admin";

  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "mood", label: "Mood Tracker", icon: Heart },
    { id: "sleep", label: "Sleep Log", icon: Moon },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "goals", label: "Goals", icon: Target },
    { id: "mindfulness", label: "Mindfulness", icon: Brain },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft">
      <div className="mb-10">
        <h1 className="bg-linear-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Pulse
        </h1>
        <p className="mt-1 text-xs text-muted">Wellness Tracker</p>
      </div>

      <div className="flex-1 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                isActive
                  ? "bg-[var(--accent)] text-white shadow-soft"
                  : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-white" />
              )}

              <Icon size={20} className={isActive ? "scale-110" : "group-hover:scale-110"} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-6">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] font-semibold text-white">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{username}</p>
            <p className="text-xs text-muted">{isAdmin ? "Admin" : "Active Member"}</p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Copyright {new Date().getFullYear()} Pulse
        </p>
      </div>
    </div>
  );
}
