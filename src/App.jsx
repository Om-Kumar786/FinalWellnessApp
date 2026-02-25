import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import NavigationSidebar from "./components/layout/NavigationSidebar";
import LoginPage from "./components/pages/LoginPage";
import LandingPage from "./components/pages/LandingPage";

const WellnessDashboard = lazy(() => import("./components/dashboard/WellnessDashboard"));
const MoodTracker = lazy(() => import("./components/pages/MoodTracker"));
const SleepLog = lazy(() => import("./components/pages/SleepLog"));
const ActivityPage = lazy(() => import("./components/pages/ActivityPage"));
const GoalsPage = lazy(() => import("./components/pages/GoalsPage"));
const MindfulnessPage = lazy(() => import("./components/pages/MindfulnessPage"));
const SettingsPage = lazy(() => import("./components/pages/SettingsPage"));
const AdminPage = lazy(() => import("./components/pages/AdminPage"));
const CheckInPage = lazy(() => import("./components/pages/CheckInPage"));

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_REMINDERS = {
  enabled: true,
  mood: { enabled: true, time: "09:00" },
  sleep: { enabled: true, time: "21:00" },
  steps: { enabled: true, time: "18:00" },
  mindfulness: { enabled: true, time: "20:00" },
};

const DEFAULT_WELLNESS_DATA = {
  mood: "Not Set",
  sleepHours: 0,
  steps: 0,
  stressLevel: "Low",
  goalsCompleted: 0,
  mindfulnessSessions: 0,
  moodHistory: [],
  sleepHistory: [],
  goals: [],
  energyLevel: "Medium",
  checkInHistory: [],
  weeklyReflection: null,
  activeChallenges: [],
};

const mergeReminderSettings = (saved, defaults = DEFAULT_REMINDERS) => ({
  ...defaults,
  ...saved,
  mood: { ...defaults.mood, ...(saved?.mood || {}) },
  sleep: { ...defaults.sleep, ...(saved?.sleep || {}) },
  steps: { ...defaults.steps, ...(saved?.steps || {}) },
  mindfulness: { ...defaults.mindfulness, ...(saved?.mindfulness || {}) },
});

const getReminderDefaults = () => {
  const adminConfig = parseJSON(localStorage.getItem("adminConfig"), {});
  return mergeReminderSettings(adminConfig?.defaultReminders || DEFAULT_REMINDERS);
};

const appendReminderFailure = (username, reminderType, reason) => {
  const failureMap = parseJSON(localStorage.getItem("reminderFailures"), {});
  const userKey = username || "guest";
  const failureList = Array.isArray(failureMap[userKey]) ? failureMap[userKey] : [];
  const nextMap = {
    ...failureMap,
    [userKey]: [
      ...failureList,
      {
        id: `${userKey}-${reminderType}-${Date.now()}`,
        reminderType,
        reason,
        at: new Date().toISOString(),
      },
    ].slice(-100),
  };
  localStorage.setItem("reminderFailures", JSON.stringify(nextMap));
};

const reminderMessages = {
  mood: {
    title: "Mood Check-in",
    body: "Take 30 seconds to log your mood for today.",
  },
  sleep: {
    title: "Sleep Log Reminder",
    body: "Update your sleep hours before you wind down.",
  },
  steps: {
    title: "Steps Goal Reminder",
    body: "Quick check: update your steps progress now.",
  },
  mindfulness: {
    title: "Mindfulness Reminder",
    body: "Take a short breathing or meditation break.",
  },
};

export default function App() {
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
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = parseJSON(localStorage.getItem("currentUser"), null);
    if (savedUser?.username) return savedUser;

    const legacyUsername = localStorage.getItem("user");
    if (localStorage.getItem("isLoggedIn") === "true" && legacyUsername) {
      return { username: legacyUsername, role: "user" };
    }

    return null;
  });

  const isLoggedIn = Boolean(currentUser?.username);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inAppReminder, setInAppReminder] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission;
  });

  const reminderStorageKey = useMemo(
    () => `reminderSettings_${currentUser?.username || "guest"}`,
    [currentUser?.username],
  );

  const reminderSentStorageKey = useMemo(
    () => `reminderSent_${currentUser?.username || "guest"}`,
    [currentUser?.username],
  );

  const wellnessStorageKey = useMemo(
    () => `wellnessData_${currentUser?.username || "guest"}`,
    [currentUser?.username],
  );

  const [reminders, setReminders] = useState(() => {
    const saved = parseJSON(localStorage.getItem(reminderStorageKey), null);
    return mergeReminderSettings(saved, getReminderDefaults());
  });

  const [wellnessData, setWellnessData] = useState(() => {
    const scopedKey = `wellnessData_${currentUser?.username || "guest"}`;
    const saved = localStorage.getItem(scopedKey) || localStorage.getItem("wellnessData");
    if (!saved) return DEFAULT_WELLNESS_DATA;
    return { ...DEFAULT_WELLNESS_DATA, ...parseJSON(saved, {}) };
  });

  useEffect(() => {
    localStorage.setItem(wellnessStorageKey, JSON.stringify(wellnessData));
  }, [wellnessData, wellnessStorageKey]);

  useEffect(() => {
    localStorage.setItem(reminderStorageKey, JSON.stringify(reminders));
  }, [reminders, reminderStorageKey]);


  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!inAppReminder) return undefined;
    const timerId = setTimeout(() => {
      setInAppReminder(null);
    }, 5500);

    return () => clearTimeout(timerId);
  }, [inAppReminder]);

  useEffect(() => {
    if (!isLoggedIn || !reminders.enabled) return undefined;

    const triggerReminder = (key) => {
      const reminderContent = reminderMessages[key];
      if (!reminderContent) return;

      if (notificationPermission === "granted" && typeof window !== "undefined") {
        try {
          new Notification(reminderContent.title, { body: reminderContent.body });
        } catch {
          appendReminderFailure(currentUser?.username, key, "notification_error");
        }
      } else {
        appendReminderFailure(currentUser?.username, key, `permission_${notificationPermission}`);
      }

      setInAppReminder({
        id: `${key}-${Date.now()}`,
        ...reminderContent,
      });
    };

    const checkAndSendReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = now.toISOString().slice(0, 10);
      const sentMap = parseJSON(localStorage.getItem(reminderSentStorageKey), {});
      let changed = false;

      ["mood", "sleep", "steps", "mindfulness"].forEach((key) => {
        const item = reminders[key];
        if (!item?.enabled || !item?.time) return;

        const sentKey = `${today}_${key}`;
        if (item.time === currentTime && !sentMap[sentKey]) {
          triggerReminder(key);
          sentMap[sentKey] = true;
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(reminderSentStorageKey, JSON.stringify(sentMap));
      }
    };

    checkAndSendReminders();
    const timerId = setInterval(checkAndSendReminders, 30000);
    return () => clearInterval(timerId);
  }, [currentUser?.username, isLoggedIn, notificationPermission, reminderSentStorageKey, reminders]);

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    localStorage.setItem(`notificationPermission_${currentUser?.username || "guest"}`, permission);
  };

  const setReminderMaster = (enabled) => {
    setReminders((prev) => ({ ...prev, enabled }));
  };

  const updateReminderItem = (key, patch) => {
    setReminders((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...patch,
      },
    }));
  };

  const loadWellnessForUser = (username) => {
    const key = `wellnessData_${username || "guest"}`;
    const saved = localStorage.getItem(key) || localStorage.getItem("wellnessData");
    return {
      ...DEFAULT_WELLNESS_DATA,
      ...parseJSON(saved, {}),
    };
  };

  const loadReminderForUser = (username) => {
    const key = `reminderSettings_${username || "guest"}`;
    return mergeReminderSettings(
      parseJSON(localStorage.getItem(key), null),
      getReminderDefaults(),
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setShowLogin(false);
    setInAppReminder(null);
    setReminders(loadReminderForUser("guest"));
    setWellnessData(loadWellnessForUser("guest"));
    setNotificationPermission(
      typeof window === "undefined" || !("Notification" in window)
        ? "unsupported"
        : Notification.permission,
    );
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        {!showLogin ? (
          <LandingPage onLoginClick={() => setShowLogin(true)} />
        ) : (
          <LoginPage
            onLogin={(user) => {
              localStorage.setItem("isLoggedIn", "true");
              setCurrentUser(user);
              setReminders(loadReminderForUser(user.username));
              setWellnessData(loadWellnessForUser(user.username));
              const savedPermission = localStorage.getItem(`notificationPermission_${user.username}`);
              setNotificationPermission(savedPermission || Notification.permission);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      {inAppReminder && <ReminderToast title={inAppReminder.title} body={inAppReminder.body} />}

      <div className="w-64 border-r border-[var(--border)] bg-[var(--surface)]">
        <NavigationSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
        />
      </div>

      <div className="flex-1 overflow-auto p-8 page-animate">
        <Suspense fallback={<div className="text-muted">Loading...</div>}>
          {activeTab === "dashboard" && (
            <WellnessDashboard
              data={wellnessData}
              setData={setWellnessData}
              currentUser={currentUser}
            />
          )}

          {activeTab === "mood" && (
            <MoodTracker data={wellnessData} setData={setWellnessData} />
          )}

          {activeTab === "checkin" && (
            <CheckInPage data={wellnessData} setData={setWellnessData} />
          )}

          {activeTab === "sleep" && (
            <SleepLog data={wellnessData} setData={setWellnessData} />
          )}

          {activeTab === "activity" && (
            <ActivityPage
              key={currentUser?.username || "guest"}
              data={wellnessData}
              setData={setWellnessData}
            />
          )}

          {activeTab === "goals" && (
            <GoalsPage data={wellnessData} setData={setWellnessData} />
          )}

          {activeTab === "mindfulness" && (
            <MindfulnessPage data={wellnessData} setData={setWellnessData} />
          )}

          {activeTab === "settings" && (
            <SettingsPage
              onLogout={handleLogout}
              currentUser={currentUser}
              reminders={reminders}
              notificationPermission={notificationPermission}
              onRequestNotificationPermission={requestNotificationPermission}
              onReminderMasterChange={setReminderMaster}
              onReminderItemChange={updateReminderItem}
            />
          )}

          {activeTab === "admin" && currentUser?.role === "admin" && (
            <AdminPage currentUser={currentUser} />
          )}
        </Suspense>
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

function ReminderToast({ title, body }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
