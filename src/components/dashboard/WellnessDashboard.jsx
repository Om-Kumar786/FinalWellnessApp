import { useEffect, useMemo, useState } from "react";
import { ChevronRight, MapPin, Search, X } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motivationLines } from "../../data/motivationLines";
import { healthTips } from "../../data/healthTips";

const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const OPEN_WEATHER_CITY = import.meta.env.VITE_OPENWEATHER_CITY;

const WEATHER_STATUS = {
  idle: "idle",
  loading: "loading",
  ready: "ready",
  error: "error",
};

const WEATHER_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";
const WEATHER_CITY_STORAGE_KEY = "weatherPreferredCity";

const getWeatherSuggestions = (weatherPayload) => {
  const suggestions = [];
  const temp = Number(weatherPayload?.main?.temp);
  const humidity = Number(weatherPayload?.main?.humidity);
  const windSpeed = Number(weatherPayload?.wind?.speed);
  const weatherMain = (weatherPayload?.weather?.[0]?.main || "").toLowerCase();

  if (!Number.isNaN(temp)) {
    if (temp >= 32) {
      suggestions.push("It is hot outside, so keep a water bottle nearby and reduce high-intensity afternoon activity.");
    } else if (temp <= 10) {
      suggestions.push("Cool weather today: add a longer warm-up before movement and keep your evening routine cozy.");
    } else {
      suggestions.push("The temperature is moderate, a short outdoor walk can boost mood and energy.");
    }
  }

  if (weatherMain.includes("rain") || weatherMain.includes("drizzle") || weatherMain.includes("thunderstorm")) {
    suggestions.push("Rain expected: switch to an indoor workout and add a 5-minute mindfulness break.");
  } else if (weatherMain.includes("clear")) {
    suggestions.push("Clear skies: get 10-15 minutes of morning daylight to support sleep rhythm.");
  } else if (weatherMain.includes("cloud")) {
    suggestions.push("Cloudy day: do a brief movement session to stay alert and avoid low-energy dips.");
  }

  if (!Number.isNaN(humidity) && humidity >= 80) {
    suggestions.push("Humidity is high, pace activity and hydrate in smaller, frequent intervals.");
  }

  if (!Number.isNaN(windSpeed) && windSpeed >= 10) {
    suggestions.push("Strong wind conditions: choose stable, low-impact routes for outdoor activity.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Keep a balanced day with hydration, movement, and a consistent sleep schedule.");
  }

  return suggestions.slice(0, 3);
};

const getWeatherSummary = (weatherPayload) => {
  const temp = Number(weatherPayload?.main?.temp);
  const weatherMain = (weatherPayload?.weather?.[0]?.main || "").toLowerCase();

  if (!Number.isNaN(temp) && temp >= 32) {
    return "Expect hot weather today. Hydration and lighter afternoon activity will help.";
  }
  if (!Number.isNaN(temp) && temp <= 10) {
    return "Cool weather ahead. Warm up before activity and keep your evening routine cozy.";
  }
  if (weatherMain.includes("rain") || weatherMain.includes("drizzle") || weatherMain.includes("thunderstorm")) {
    return "Rain likely. Choose indoor movement and a short mindfulness break.";
  }
  if (weatherMain.includes("clear")) {
    return "Clear sky today. A short morning walk can improve mood and sleep rhythm.";
  }
  return "Weather is moderate. Keep a balanced day with movement, hydration, and recovery.";
};

export default function WellnessDashboard({ data, setData, currentUser }) {
  const username = currentUser?.username || localStorage.getItem("user") || "User";
  const today = new Date().toLocaleDateString();
  const [lineIndex, setLineIndex] = useState(() => {
    if (motivationLines.length === 0) return 0;
    return new Date().getSeconds() % motivationLines.length;
  });
  const [tipIndex, setTipIndex] = useState(() => {
    if (healthTips.length === 0) return 0;
    return new Date().getSeconds() % healthTips.length;
  });
  const [weatherState, setWeatherState] = useState({
    status: WEATHER_STATUS.idle,
    payload: null,
    suggestions: [],
    message: "",
  });
  const [isWeatherPanelOpen, setIsWeatherPanelOpen] = useState(false);
  const [locationInput, setLocationInput] = useState(
    () => localStorage.getItem(WEATHER_CITY_STORAGE_KEY) || OPEN_WEATHER_CITY || "",
  );

  const moodHistory = data?.moodHistory || [];
  const sleepHistory = data?.sleepHistory || [];
  const goals = data?.goals || [];
  const checkInHistory = useMemo(() => data?.checkInHistory || [], [data?.checkInHistory]);
  const completed = goals.filter((g) => g.completed).length;

  const wellnessScore = (data.sleepHours >= 8 ? 25 : 10) + (data.steps >= 8000 ? 25 : 10) + completed * 10;

  const moodCount = {};
  moodHistory.forEach((item) => {
    moodCount[item.mood] = (moodCount[item.mood] || 0) + 1;
  });

  const moodColors = {
    Great: "#4ade80",
    Good: "#60a5fa",
    Okay: "#fbbf24",
    Stressed: "#f87171",
  };

  const moodData = Object.keys(moodCount).map((key) => ({
    name: key,
    value: moodCount[key],
    color: moodColors[key],
  }));

  const checkInStreak = useMemo(() => {
    if (checkInHistory.length === 0) return 0;
    const sorted = [...checkInHistory]
      .map((entry) => new Date(entry.date || 0))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let index = 0; index < sorted.length; index += 1) {
      const entryDate = sorted[index];
      const normalized = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      );
      if (normalized.getTime() === cursor.getTime()) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (normalized.getTime() < cursor.getTime()) {
        break;
      }
    }

    return streak;
  }, [checkInHistory]);

  const todayKey = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const hasTodayCheckIn = checkInHistory.some((entry) => entry.day === todayKey);
  const nudgeMessage = hasTodayCheckIn
    ? "You already checked in today. Keep momentum with one mindful activity."
    : "You have not checked in yet today. Use Daily Check-in for a 30-second wellness snapshot.";

  const lastTwoSleep = sleepHistory.slice(-2);
  const sleepTrend = lastTwoSleep.length === 2
    ? Number(lastTwoSleep[1].hours || 0) - Number(lastTwoSleep[0].hours || 0)
    : 0;

  useEffect(() => {
    if (motivationLines.length <= 1) return undefined;
    const timerId = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % motivationLines.length);
    }, 30000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (healthTips.length <= 1) return undefined;
    const timerId = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 40000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setError = (message) => {
      if (cancelled) return;
      setWeatherState({
        status: WEATHER_STATUS.error,
        payload: null,
        suggestions: [],
        message,
      });
    };

    const fetchWeather = async (queryString) => {
      setWeatherState((prev) => ({ ...prev, status: WEATHER_STATUS.loading, message: "" }));
      try {
        const response = await fetch(`${WEATHER_ENDPOINT}?${queryString}&units=metric&appid=${OPEN_WEATHER_API_KEY}`);
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }
        const payload = await response.json();
        if (cancelled) return;
        if (payload?.name) {
          setLocationInput(payload.name);
          localStorage.setItem(WEATHER_CITY_STORAGE_KEY, payload.name);
        }
        setWeatherState({
          status: WEATHER_STATUS.ready,
          payload,
          suggestions: getWeatherSuggestions(payload),
          message: "",
        });
      } catch {
        setError("Unable to load weather right now. Please try again in a bit.");
      }
    };

    if (!OPEN_WEATHER_API_KEY) {
      setError("Add VITE_OPENWEATHER_API_KEY in your .env file to enable weather-based suggestions.");
      return () => {
        cancelled = true;
      };
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(`lat=${latitude}&lon=${longitude}`);
        },
        () => {
          if (OPEN_WEATHER_CITY) {
            fetchWeather(`q=${encodeURIComponent(OPEN_WEATHER_CITY)}`);
          } else {
            setError("Location permission is blocked. Add VITE_OPENWEATHER_CITY in .env for a fallback city.");
          }
        },
        { timeout: 10000 },
      );
    } else if (OPEN_WEATHER_CITY) {
      fetchWeather(`q=${encodeURIComponent(OPEN_WEATHER_CITY)}`);
    } else {
      setError("Geolocation is unavailable. Add VITE_OPENWEATHER_CITY in .env to use weather insights.");
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshWeatherByCity = async (cityName) => {
    const nextCity = cityName.trim();
    if (!nextCity) {
      setWeatherState({
        status: WEATHER_STATUS.error,
        payload: null,
        suggestions: [],
        message: "Enter a city name to refresh weather insights.",
      });
      return;
    }

    if (!OPEN_WEATHER_API_KEY) {
      setWeatherState({
        status: WEATHER_STATUS.error,
        payload: null,
        suggestions: [],
        message: "Missing API key. Add VITE_OPENWEATHER_API_KEY in your .env file.",
      });
      return;
    }

    setWeatherState((prev) => ({ ...prev, status: WEATHER_STATUS.loading, message: "" }));

    try {
      const response = await fetch(
        `${WEATHER_ENDPOINT}?q=${encodeURIComponent(nextCity)}&units=metric&appid=${OPEN_WEATHER_API_KEY}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      const payload = await response.json();
      const resolvedCity = payload?.name || nextCity;
      setLocationInput(resolvedCity);
      localStorage.setItem(WEATHER_CITY_STORAGE_KEY, resolvedCity);
      setWeatherState({
        status: WEATHER_STATUS.ready,
        payload,
        suggestions: getWeatherSuggestions(payload),
        message: "",
      });
    } catch {
      setWeatherState({
        status: WEATHER_STATUS.error,
        payload: null,
        suggestions: [],
        message: "Could not find weather for that location. Try a valid city name.",
      });
    }
  };

  const activeLine = motivationLines[lineIndex] || {
    lang: "EN",
    text: "Keep going, your future self will thank you.",
  };
  const activeTip = healthTips[tipIndex] || "Stay active, hydrated and consistent with sleep.";
  const reflection = data?.weeklyReflection;
  const reflectionChoices = ["Best day", "Hardest moment", "What helped most"];

  const wellnessPercent = Math.min(Math.max(wellnessScore, 0), 100);
  const weatherCityLabel = weatherState.payload?.name || locationInput || "Weather";
  const weatherTempLabel = weatherState.payload?.main?.temp != null
    ? `${Math.round(Number(weatherState.payload.main.temp))} C`
    : "-- C";
  const weatherSummary = weatherState.status === WEATHER_STATUS.ready
    ? getWeatherSummary(weatherState.payload)
    : "Tap to open weather suggestions and location controls.";

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back, {username}</h1>
          <p className="text-muted">{today}</p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="surface flex items-center gap-4 rounded-2xl px-5 py-3 shadow-soft">
            <ProgressRing value={wellnessPercent} />
            <div>
              <p className="text-xs text-muted">Wellness Score</p>
              <p className="font-semibold">{wellnessScore}/100</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWeatherPanelOpen(true)}
            className="w-full rounded-2xl border border-white/20 bg-gradient-to-br from-sky-600 to-blue-800 p-4 text-left text-white shadow-soft transition hover:-translate-y-0.5 md:w-[360px]"
          >
            <div className="flex items-center justify-between text-sm">
              <p className="inline-flex items-center gap-1 font-semibold">
                <MapPin size={14} />
                {weatherCityLabel}
              </p>
              <span className="opacity-80">...</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-5xl font-light leading-none">{weatherTempLabel}</p>
              <p className="max-w-[180px] text-sm text-blue-50">
                {weatherState.status === WEATHER_STATUS.loading ? "Fetching latest weather..." : weatherSummary}
              </p>
            </div>
            <p className="mt-3 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm">
              See weather suggestions <ChevronRight size={15} className="ml-1" />
            </p>
          </button>
        </div>
      </div>

      {isWeatherPanelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/25 p-4 backdrop-blur-sm">
          <div className="ml-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Weather Suggestions</h3>
              <button
                type="button"
                onClick={() => setIsWeatherPanelOpen(false)}
                className="rounded-full border border-[var(--border)] p-2 text-muted transition hover:text-[var(--text)]"
                aria-label="Close weather panel"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-2 text-sm text-muted">
              Update location to get weather-based wellness actions.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="Enter city name"
                className="input w-full rounded-xl px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => refreshWeatherByCity(locationInput)}
                className="btn-primary inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium"
              >
                <Search size={14} />
                Update
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              {weatherState.status === WEATHER_STATUS.loading && (
                <p className="text-sm text-muted">Loading weather data...</p>
              )}
              {weatherState.status === WEATHER_STATUS.error && (
                <p className="text-sm text-muted">{weatherState.message}</p>
              )}
              {weatherState.status === WEATHER_STATUS.ready && (
                <>
                  <p className="text-sm font-semibold">
                    {weatherState.payload?.name}, {weatherTempLabel}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {(weatherState.payload?.weather?.[0]?.description || "Current weather")}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    {weatherState.suggestions.map((tip) => (
                      <li key={tip}>- {tip}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-400 bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
          <p className="text-sm font-semibold">Current Check-in Streak: {checkInStreak} day(s)</p>
          <p className="mt-1 text-sm">
            {checkInStreak >= 3
              ? "Milestone reached. Keep the streak alive tomorrow."
              : "Complete daily check-ins to unlock streak celebrations."}
          </p>
        </div>
        <div className="surface rounded-xl border p-4">
          <p className="text-sm font-semibold">Personalized Nudge</p>
          <p className="mt-1 text-sm text-muted">{nudgeMessage}</p>
          <p className="mt-2 text-xs text-muted">
            Sleep trend: {sleepTrend > 0 ? "up" : sleepTrend < 0 ? "down" : "steady"}{" "}
            {sleepTrend !== 0 ? `${Math.abs(sleepTrend).toFixed(1)}h` : ""}
          </p>
        </div>
      </div>

      <div className="accent-soft rounded-xl p-6">
        <p className="accent-text mb-2 text-xs font-semibold uppercase tracking-wide">
          {activeLine.lang}
        </p>
        <p className="accent-text font-medium">"{activeLine.text}"</p>
      </div>

      <div className="surface card rounded-xl border border-[var(--border)] p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Health Tip
        </p>
        <p className="text-sm font-medium text-[var(--text)]">{activeTip}</p>
      </div>

      <div className="surface card p-6">
        <h3 className="mb-3 font-semibold">Weekly Reflection</h3>
        <p className="mb-3 text-sm text-muted">Tap one prompt and store this week&apos;s insight.</p>
        <div className="flex flex-wrap gap-2">
          {reflectionChoices.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  weeklyReflection: {
                    prompt: choice,
                    updatedAt: new Date().toISOString(),
                  },
                }))
              }
              className={`rounded-full border px-3 py-1 text-sm ${
                reflection?.prompt === choice
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-[var(--surface-2)]"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
        {reflection?.prompt && (
          <p className="mt-3 text-sm text-muted">
            Saved reflection: {reflection.prompt}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <StatCard title="Mood" value={data.mood || "Not Set"} icon="Mood" color="from-green-400 to-emerald-500" />
        <StatCard title="Sleep" value={`${data.sleepHours || 0} hrs`} icon="Sleep" color="from-indigo-400 to-purple-500" />
        <StatCard title="Steps" value={data.steps || 0} icon="Steps" color="from-blue-400 to-cyan-500" />
        <StatCard title="Stress" value={data.stressLevel || "Low"} icon="Stress" color="from-red-400 to-orange-500" />
      </div>

      <div className="surface card p-6">
        <h3 className="mb-3 font-semibold">Goal Progress</h3>

        {goals.length > 0 ? (
          <>
            <p className="mb-3">
              {completed} of {goals.length} goals completed
            </p>

            <ul className="space-y-2">
              {goals.slice(0, 3).map((goal) => (
                <li key={goal.id} className="flex items-center justify-between">
                  <span className={goal.completed ? "line-through text-soft" : ""}>{goal.text}</span>
                  {goal.completed && <span>Done</span>}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-muted">No goals yet</p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="surface card-lg p-6 transition hover:shadow-lg">
          <h3 className="mb-4 font-semibold">Mood Distribution</h3>

          {moodData.length === 0 ? (
            <p className="text-muted">No Data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={moodData} dataKey="value" innerRadius={50} outerRadius={90}>
                  {moodData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "var(--text)" }}
                  labelStyle={{ color: "var(--muted)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="surface card-lg p-6 transition hover:shadow-lg">
          <h3 className="mb-4 font-semibold">Sleep Trends</h3>

          {sleepHistory.length === 0 ? (
            <p className="text-muted">No Data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sleepHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: "var(--muted)" }} />
                <YAxis tick={{ fill: "var(--muted)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "var(--text)" }}
                  labelStyle={{ color: "var(--muted)" }}
                />
                <Line type="monotone" dataKey="hours" stroke="var(--accent)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ value }) {
  return (
    <div
      className="relative h-14 w-14 rounded-full"
      style={{
        background: `conic-gradient(var(--accent) ${value * 3.6}deg, var(--surface-3) 0deg)`,
      }}
    >
      <div className="absolute inset-1 rounded-full bg-[var(--surface)]" />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {Math.round(value)}%
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`bg-linear-to-r ${color} rounded-2xl p-6 text-white shadow-soft transition hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
        </div>
        <span className="text-sm uppercase tracking-wide opacity-90">{icon}</span>
      </div>
    </div>
  );
}
