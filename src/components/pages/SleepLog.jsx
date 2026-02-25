import { useMemo, useState } from "react";

const goalHours = 8;

const getSleepFeedback = (hours) => {
  if (!hours || hours <= 0) {
    return "Log your sleep to get a personalized suggestion.";
  }

  const gap = Math.max(goalHours - hours, 0);
  const gapMinutes = Math.round(gap * 60);

  if (hours >= goalHours) {
    return "Great sleep. Keep the same routine tonight to protect this trend.";
  }

  if (hours >= 6) {
    return `You slept ${hours.toFixed(1)}h. Try adding +${gapMinutes} mins tonight.`;
  }

  return `You slept ${hours.toFixed(1)}h. Recovery night: target +${gapMinutes} mins and start winding down earlier.`;
};

const buildTips = ({ sleepHours, history, habits }) => {
  const tips = [];
  const average =
    history.length > 0
      ? history.reduce((sum, day) => sum + Number(day.hours || 0), 0) / history.length
      : 0;

  if (sleepHours > 0 && sleepHours < 7) {
    const earlierMinutes = Math.round((goalHours - sleepHours) * 60);
    tips.push(`Set a wind-down alarm ${earlierMinutes} minutes earlier tonight.`);
  }

  if (habits.lateCaffeine) {
    tips.push("Avoid caffeine at least 8 hours before your target bedtime.");
  }

  if (habits.phoneInBed) {
    tips.push("Use a no-screen rule for the final 30 minutes before sleep.");
  }

  if (history.length >= 4) {
    const hours = history.map((item) => Number(item.hours || 0));
    const spread = Math.max(...hours) - Math.min(...hours);
    if (spread >= 2) {
      tips.push("Your sleep duration swings a lot. Keep bedtime and wake time more consistent.");
    }
  }

  if (average >= 7.5 && !habits.lateCaffeine && !habits.phoneInBed) {
    tips.push("Your routine looks strong. Keep this pattern for the next week.");
  }

  if (tips.length === 0) {
    tips.push("Aim for a steady bedtime and protect at least 8 hours in bed.");
  }

  return tips;
};

export default function SleepLog({ data, setData }) {
  const sleepHours = Number(data.sleepHours || 0);
  const percentage = Math.min((sleepHours / goalHours) * 100, 100);
  const sleepHistory = useMemo(() => data.sleepHistory || [], [data.sleepHistory]);

  const [sleepHabits, setSleepHabits] = useState({
    lateCaffeine: false,
    phoneInBed: false,
  });
  const [coachStep, setCoachStep] = useState(0);
  const [coachAnswer, setCoachAnswer] = useState("");

  const coachQuestions = [
    {
      q: "What made sleep hardest yesterday?",
      options: ["Late work", "Phone scrolling", "Stress", "No issue"],
    },
    {
      q: "What can you improve tonight?",
      options: ["Sleep earlier", "No caffeine late", "No phone in bed", "Short breathing"],
    },
  ];

  const sleepFeedback = useMemo(() => getSleepFeedback(sleepHours), [sleepHours]);
  const personalizedTips = useMemo(
    () => buildTips({ sleepHours, history: sleepHistory, habits: sleepHabits }),
    [sleepHabits, sleepHistory, sleepHours],
  );

  const handleSleep = (hours) => {
    const parsed = Number(hours);
    if (Number.isNaN(parsed)) return;

    const safeHours = Math.max(0, Math.min(parsed, 24));
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "short",
    });

    setData((prev) => ({
      ...prev,
      sleepHours: safeHours,
      sleepHistory: [
        ...prev.sleepHistory.filter((s) => s.day !== today),
        { day: today, hours: safeHours },
      ],
    }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <h1 className="text-3xl font-semibold">Sleep Log</h1>

      <div className="surface card space-y-6 p-8 text-center">
        <p className="text-sm text-muted">Last Logged Sleep</p>

        <h2 className="text-6xl font-bold accent-text">{sleepHours} hrs</h2>

        <div className="mt-4 h-4 rounded-full bg-[var(--surface-3)]">
          <div
            className="h-4 rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-muted">{percentage.toFixed(0)}% of 8 hour goal</p>

        <div className="rounded-xl accent-soft p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Smart feedback</p>
          <p className="mt-2 text-sm">{sleepFeedback}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Why this suggestion</p>
          <p className="mt-2 text-sm text-muted">
            {sleepHours < 6
              ? "Your sleep is below recovery range, so the tip focuses on adding sleep time tonight."
              : sleepHours < 8
                ? "You are close to target, so the tip pushes a small minutes increase instead of a drastic change."
                : "You hit your target, so the tip focuses on maintaining consistency."}
          </p>
        </div>
      </div>

      <div className="surface card space-y-4 p-6">
        <p className="font-medium text-muted">Quick Log</p>

        <div className="flex flex-wrap gap-4">
          {[5, 6, 7, 8, 9].map((hrs) => (
            <button
              key={hrs}
              type="button"
              onClick={() => handleSleep(hrs)}
              className={`rounded-lg border px-4 py-2 transition ${
                sleepHours === hrs
                  ? "border-transparent bg-[var(--accent)] text-white"
                  : "border-[var(--border)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {hrs} hrs
            </button>
          ))}
        </div>
      </div>

      <div className="surface card space-y-4 p-6">
        <p className="font-medium text-muted">Enter Custom Hours</p>

        <input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={sleepHours}
          onChange={(e) => handleSleep(e.target.value)}
          className="input w-full rounded-lg p-3 transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder="Enter sleep hours"
        />
      </div>

      <div className="surface card space-y-4 p-6">
        <p className="font-medium text-muted">Sleep Coach Chat</p>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-sm font-medium">{coachQuestions[coachStep].q}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {coachQuestions[coachStep].options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setCoachAnswer(option);
                  setCoachStep((prev) => (prev + 1) % coachQuestions.length);
                }}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs hover:bg-[var(--surface-3)]"
              >
                {option}
              </button>
            ))}
          </div>
          {coachAnswer && (
            <p className="mt-3 text-xs text-muted">
              Last answer: {coachAnswer}
            </p>
          )}
        </div>
      </div>

      <div className="surface card space-y-4 p-6">
        <p className="font-medium text-muted">Helpful Prompts</p>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="surface-2 flex items-start gap-3 rounded-xl p-4">
            <input
              type="checkbox"
              checked={sleepHabits.lateCaffeine}
              onChange={(e) =>
                setSleepHabits((prev) => ({ ...prev, lateCaffeine: e.target.checked }))
              }
              className="mt-1"
            />
            <span className="text-sm">Had caffeine in the evening (last 6-8 hours)?</span>
          </label>

          <label className="surface-2 flex items-start gap-3 rounded-xl p-4">
            <input
              type="checkbox"
              checked={sleepHabits.phoneInBed}
              onChange={(e) =>
                setSleepHabits((prev) => ({ ...prev, phoneInBed: e.target.checked }))
              }
              className="mt-1"
            />
            <span className="text-sm">Used phone in bed before sleeping?</span>
          </label>
        </div>
      </div>

      <div className="surface card space-y-4 p-6">
        <h3 className="font-semibold">Personalized Tips</h3>
        <div className="space-y-2">
          {personalizedTips.map((tip) => (
            <p key={tip} className="rounded-lg accent-soft p-3 text-sm">
              {tip}
            </p>
          ))}
        </div>
      </div>

      {sleepHistory.length > 0 && (
        <div className="surface card p-6">
          <h3 className="mb-4 font-semibold">Weekly Sleep Summary</h3>

          <div className="grid grid-cols-4 gap-3 text-center md:grid-cols-7">
            {sleepHistory.map((item, index) => (
              <div key={`${item.day}-${index}`} className="accent-soft rounded-lg p-3">
                <p className="text-sm text-muted">{item.day}</p>
                <p className="font-semibold">{item.hours}h</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
