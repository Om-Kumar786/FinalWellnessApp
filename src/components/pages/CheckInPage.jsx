import { useMemo, useState } from "react";

const moods = ["Great", "Good", "Okay", "Stressed"];
const sleepChoices = [5, 6, 7, 8, 9];
const energyChoices = ["Low", "Medium", "High"];

const getTip = ({ mood, sleepHours, energy }) => {
  if (sleepHours < 6) {
    return {
      title: "Sleep Recovery Tip",
      body: "Try a 30-minute earlier wind-down tonight and avoid screens in the last 30 minutes.",
      reason: `Because sleep was ${sleepHours}h, your body may need extra recovery.`,
    };
  }

  if (mood === "Stressed" || energy === "Low") {
    return {
      title: "Stress Reset Tip",
      body: "Take a 5-minute breathing break and split your next task into one small step.",
      reason: `Because your mood is ${mood} and energy is ${energy}, a short reset can reduce overload.`,
    };
  }

  return {
    title: "Momentum Tip",
    body: "Keep your routine steady today and lock your usual bedtime to protect consistency.",
    reason: "Because your check-in looks stable, consistency is your biggest advantage right now.",
  };
};

export default function CheckInPage({ data, setData }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    mood: data.mood && data.mood !== "Not Set" ? data.mood : "Good",
    sleepHours: Number(data.sleepHours || 7),
    energy: data.energyLevel || "Medium",
  });

  const steps = [
    { key: "mood", title: "How do you feel right now?" },
    { key: "sleepHours", title: "How many hours did you sleep?" },
    { key: "energy", title: "How is your energy today?" },
  ];

  const currentStep = steps[step];
  const tip = useMemo(() => getTip(answers), [answers]);
  const completed = step >= steps.length;

  const saveCheckIn = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
    const logDate = new Date().toISOString();

    setData((prev) => ({
      ...prev,
      mood: answers.mood,
      sleepHours: answers.sleepHours,
      energyLevel: answers.energy,
      moodHistory: [
        ...prev.moodHistory.filter((entry) => entry.day !== today),
        { day: today, mood: answers.mood },
      ],
      sleepHistory: [
        ...prev.sleepHistory.filter((entry) => entry.day !== today),
        { day: today, hours: answers.sleepHours },
      ],
      checkInHistory: [
        ...(prev.checkInHistory || []).filter((entry) => entry.day !== today),
        {
          day: today,
          date: logDate,
          mood: answers.mood,
          sleepHours: answers.sleepHours,
          energy: answers.energy,
        },
      ],
    }));

    setStep(steps.length + 1);
  };

  const restart = () => {
    setStep(0);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <h1 className="text-3xl font-semibold">Daily Check-in Story</h1>

      <div className="surface card p-6">
        <p className="text-sm text-muted">Step {Math.min(step + 1, 4)} of 4</p>
        <div className="mt-3 h-2 rounded-full bg-[var(--surface-3)]">
          <div
            className="h-2 rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${Math.min(((step + 1) / 4) * 100, 100)}%` }}
          />
        </div>
      </div>

      {!completed && (
        <div className="surface card space-y-6 p-8">
          <h2 className="text-2xl font-semibold">{currentStep.title}</h2>

          {currentStep.key === "mood" && (
            <div className="flex flex-wrap gap-3">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, mood }))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    answers.mood === mood
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)] bg-[var(--surface-2)]"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          )}

          {currentStep.key === "sleepHours" && (
            <div className="flex flex-wrap gap-3">
              {sleepChoices.map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, sleepHours: hours }))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    answers.sleepHours === hours
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)] bg-[var(--surface-2)]"
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          )}

          {currentStep.key === "energy" && (
            <div className="flex flex-wrap gap-3">
              {energyChoices.map((energy) => (
                <button
                  key={energy}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, energy }))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    answers.energy === energy
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)] bg-[var(--surface-2)]"
                  }`}
                >
                  {energy}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep((prev) => prev + 1)}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {completed && (
        <div className="space-y-6">
          <div className="surface card rounded-xl border border-[var(--accent)] p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Why this suggestion
            </p>
            <h3 className="mt-2 text-xl font-semibold">{tip.title}</h3>
            <p className="mt-2 text-sm">{tip.body}</p>
            <p className="mt-2 text-sm text-muted">{tip.reason}</p>
          </div>

          <div className="surface card p-6">
            <h3 className="text-lg font-semibold">Ready to save today&apos;s check-in?</h3>
            <p className="mt-2 text-sm text-muted">
              Mood: {answers.mood} | Sleep: {answers.sleepHours}h | Energy: {answers.energy}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={saveCheckIn}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Save Check-in
              </button>
              <button
                type="button"
                onClick={restart}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
              >
                Start Again
              </button>
            </div>
          </div>

          {step > steps.length && (
            <div className="rounded-xl border border-emerald-400 bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-200">
              Check-in complete. Nice consistency win for today.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
