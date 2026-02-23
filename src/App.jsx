import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
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

  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowLogin(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /* ================= LANDING + LOGIN FLOW ================= */

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
      </div>
    );
  }

  /* ================= MAIN APP ================= */

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {/* Sidebar */}
      <div className="w-64 border-r border-[var(--border)] bg-[var(--surface)]">
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

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="fixed right-6 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium shadow-soft backdrop-blur transition hover:-translate-y-0.5"
      aria-label="Toggle theme"
      type="button"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
