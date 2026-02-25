import { useEffect, useMemo, useState } from "react";
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

  const activeLine = motivationLines[lineIndex] || {
    lang: "EN",
    text: "Keep going, your future self will thank you.",
  };
  const activeTip = healthTips[tipIndex] || "Stay active, hydrated and consistent with sleep.";
  const reflection = data?.weeklyReflection;
  const reflectionChoices = ["Best day", "Hardest moment", "What helped most"];

  const wellnessPercent = Math.min(Math.max(wellnessScore, 0), 100);

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back, {username}</h1>
          <p className="text-muted">{today}</p>
        </div>

        <div className="surface flex items-center gap-4 rounded-2xl px-5 py-3 shadow-soft">
          <ProgressRing value={wellnessPercent} />
          <div>
            <p className="text-xs text-muted">Wellness Score</p>
            <p className="font-semibold">{wellnessScore}/100</p>
          </div>
        </div>
      </div>

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
