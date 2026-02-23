import { useState, useEffect } from "react";
import NavigationSidebar from "./components/layout/NavigationSidebar";
import WellnessDashboard from "./components/dashboard/WellnessDashboard";
import MoodTracker from "./components/pages/MoodTracker";
import SleepLog from "./components/pages/SleepLog";
import ActivityPage from "./components/pages/ActivityPage";
import GoalsPage from "./components/pages/GoalsPage";
import MindfulnessPage from "./components/pages/MindfulnessPage";
import SettingsPage from "./components/pages/SettingsPage";
import LoginPage from "./components/pages/LoginPage";
import LandingPage from "./components/pages/LandingPage";

export default function App() {

  /* ================= LOGIN STATE ================= */

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [showLogin, setShowLogin] = useState(false);
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
      goals: [], // ✅ IMPORTANT
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
    localStorage.setItem("wellnessData", JSON.stringify(wellnessData));
  }, [wellnessData]);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowLogin(false);
  };

  /* ================= LANDING + LOGIN FLOW ================= */

  if (!isLoggedIn) {
    return (
      <>
        {!showLogin ? (
          <LandingPage onLoginClick={() => setShowLogin(true)} />
        ) : (
          <LoginPage
            onLogin={() => {
              localStorage.setItem("isLoggedIn", "true");
              setIsLoggedIn(true);
            }}
          />
        )}
      </>
    );
  }

  /* ================= MAIN APP ================= */

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">

      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <NavigationSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 page-animate">

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