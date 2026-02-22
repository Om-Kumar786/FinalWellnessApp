import { useState, useEffect } from "react";
import NavigationSidebar from "./components/layout/NavigationSidebar";
import WellnessDashboard from "./components/dashboard/WellnessDashboard";
import MoodTracker from "./components/pages/MoodTracker";
import SleepLog from "./components/pages/SleepLog";
import ActivityPage from "./components/pages/ActivityPage";
import GoalsPage from "./components/pages/GoalsPage";
import MindfulnessPage from "./components/pages/Mindfulnesspage";
import SettingsPage from "./components/pages/SettingsPage";
import LoginPage from "./components/pages/LoginPage";

export default function App() {

  /* ================= LOGIN STATE ================= */

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [activeTab, setActiveTab] = useState("dashboard");

  /* ================= WELLNESS DATA ================= */

  const [wellnessData, setWellnessData] = useState(() => {
    const saved = localStorage.getItem("wellnessData");

    const defaultData = {
      mood: "Not Set",
      sleepHours: 0,
      steps: 0,
      stressLevel: "Low",
      goalsCompleted: 0,
      mindfulnessSessions: 0,
      moodHistory: [],
      sleepHistory: [],
    };

    if (!saved) return defaultData;

    try {
      return { ...defaultData, ...JSON.parse(saved) };
    } catch {
      return defaultData;
    }
  });

  /* ================= SAVE DATA ================= */

  useEffect(() => {
    localStorage.setItem(
      "wellnessData",
      JSON.stringify(wellnessData)
    );
  }, [wellnessData]);

  /* ================= LOGOUT FUNCTION ================= */

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false); // 🔥 THIS is what triggers login screen
  };

  /* ================= PROTECTED ROUTE ================= */

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          localStorage.setItem("isLoggedIn", "true");
          setIsLoggedIn(true);
        }}
      />
    );
  }

  /* ================= MAIN APP ================= */

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div className="w-64 border-r">
        <NavigationSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">

        {activeTab === "dashboard" && (
          <WellnessDashboard data={wellnessData} />
        )}

        {activeTab === "mood" && (
          <MoodTracker
            data={wellnessData}
            setData={setWellnessData}
          />
        )}

        {activeTab === "sleep" && (
          <SleepLog
            data={wellnessData}
            setData={setWellnessData}
          />
        )}

        {activeTab === "activity" && (
          <ActivityPage
            data={wellnessData}
            setData={setWellnessData}
          />
        )}

        {activeTab === "goals" && (
          <GoalsPage
            data={wellnessData}
            setData={setWellnessData}
          />
        )}

        {activeTab === "mindfulness" && (
          <MindfulnessPage
            data={wellnessData}
            setData={setWellnessData}
          />
        )}

        {activeTab === "settings" && (
          <SettingsPage onLogout={handleLogout} />
        )}

      </div>
    </div>
  );
}