import {
  LayoutDashboard,
  Heart,
  Moon,
  Activity,
  Target,
  Brain,
  Settings,
} from "lucide-react";

export default function NavigationSidebar({ activeTab, onTabChange }) {
  const username = localStorage.getItem("user") || "User";

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
    <div className="h-screen w-64 bg-white border-r shadow-xl flex flex-col p-6">

      {/* Brand */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
          Pulse
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Wellness Tracker
        </p>
      </div>

      {/* Navigation */}
      <div className="space-y-2 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full"></span>
              )}

              <Icon
                size={20}
                className={`transition-all duration-300 ${
                  isActive
                    ? "scale-110"
                    : "group-hover:scale-110"
                }`}
              />

              <span className="font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t pt-6 mt-6">

        {/* User Section */}
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white rounded-full font-semibold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{username}</p>
            <p className="text-xs text-gray-400">Active Member</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          © {new Date().getFullYear()} Pulse
        </p>
      </div>
    </div>
  );
}