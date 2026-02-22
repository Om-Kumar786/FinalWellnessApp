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

  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "mood", label: "Mood Tracker", icon: Heart },
    { id: "sleep", label: "Sleep Log", icon: Moon },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "goals", label: "Goals", icon: Target },
    { id: "mindfulness", label: "Mindfulness", icon: Brain },
    { id: "settings", label: "Settings", icon: Settings }, // 🔥 MOVED HERE
  ];

  return (
    <div className="h-screen bg-white border-r p-6">
      <h1 className="text-xl font-bold mb-8">
        WellnessHub
      </h1>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${
                activeTab === item.id
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}