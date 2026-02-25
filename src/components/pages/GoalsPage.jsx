import { useState } from "react";

const DEFAULT_GOALS = [
  "Walk 10,000 steps daily",
  "Sleep 8 hours every night",
  "Drink 3L of water",
  "Meditate for 15 minutes",
  "Reduce screen time",
];

const getGoalTemplates = () => {
  try {
    const adminConfig = JSON.parse(localStorage.getItem("adminConfig")) || {};
    const templates = adminConfig.goalTemplates;
    if (!Array.isArray(templates) || templates.length === 0) {
      return DEFAULT_GOALS;
    }
    return templates;
  } catch {
    return DEFAULT_GOALS;
  }
};

export default function GoalsPage({ data, setData }) {
  const predefinedGoals = getGoalTemplates();

  const [customGoal, setCustomGoal] = useState("");
  const [coachIndex, setCoachIndex] = useState(0);
  const [coachReply, setCoachReply] = useState("");

  const goals = data?.goals || [];
  const activeChallenges = data?.activeChallenges || [];
  const coachPrompts = [
    {
      q: "What blocked your goal progress today?",
      options: ["Time", "Low energy", "Forgot", "No blocker"],
    },
    {
      q: "Pick one action for today:",
      options: ["10-minute start", "Set reminder", "Do it now", "Break into 2 steps"],
    },
  ];
  const challengeTemplates = [
    { id: "sleep-consistency", title: "3-Day Sleep Consistency", target: 3 },
    { id: "steps-boost", title: "4-Day Step Boost (8k+)", target: 4 },
    { id: "mindful-minute", title: "5-Day Mindfulness Streak", target: 5 },
  ];

  const addGoal = (goalText) => {
    if (!goalText.trim()) return;

    setData((prev) => ({
      ...prev,
      goals: [
        ...(prev.goals || []),
        { id: Date.now(), text: goalText, completed: false, completedAt: null }
      ]
    }));
  };

  const toggleGoal = (id) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed: !goal.completed,
              completedAt: !goal.completed ? new Date().toISOString() : null,
            }
          : goal
      ),
    }));
  };

  const deleteGoal = (id) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal.id !== id),
    }));
  };

  const completed = goals.filter(g => g.completed).length;
  const percent = goals.length > 0
    ? Math.round((completed / goals.length) * 100)
    : 0;

  const completionStreak = (() => {
    const completionDates = goals
      .filter((goal) => goal.completed && goal.completedAt)
      .map((goal) => {
        const date = new Date(goal.completedAt);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      });

    const uniqueDates = [...new Set(completionDates)].sort((a, b) => b - a);
    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let index = 0; index < uniqueDates.length; index += 1) {
      if (uniqueDates[index] === cursor.getTime()) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (uniqueDates[index] < cursor.getTime()) {
        break;
      }
    }

    return streak;
  })();

  const startChallenge = (challenge) => {
    if (activeChallenges.some((entry) => entry.id === challenge.id)) return;
    setData((prev) => ({
      ...prev,
      activeChallenges: [
        ...(prev.activeChallenges || []),
        { ...challenge, progress: 0, completed: false },
      ],
    }));
  };

  const advanceChallenge = (challengeId) => {
    setData((prev) => ({
      ...prev,
      activeChallenges: (prev.activeChallenges || []).map((challenge) => {
        if (challenge.id !== challengeId) return challenge;
        const nextProgress = Math.min(challenge.progress + 1, challenge.target);
        return {
          ...challenge,
          progress: nextProgress,
          completed: nextProgress >= challenge.target,
        };
      }),
    }));
  };

  return (
    <div className="p-8 space-y-8">

      <h1 className="text-3xl font-semibold">Goals</h1>

      {/* Progress */}
      <div className="surface card p-6">
        <p className="font-medium">
          Progress: {completed} / {goals.length} completed ({percent}%)
        </p>
        <p className="mt-2 text-sm text-muted">Completion streak: {completionStreak} day(s)</p>

        <div className="w-full bg-[var(--surface-3)] h-3 rounded-full mt-3">
          <div
            className="bg-[var(--accent)] h-3 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {percent === 100 && goals.length > 0 && (
        <div className="rounded-xl border border-emerald-400 bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
          Celebration: all goals complete. Keep this momentum tomorrow.
        </div>
      )}

      {/* Predefined Goals */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Choose a Goal</h2>
        <div className="flex flex-wrap gap-3">
          {predefinedGoals.map((goal, index) => (
            <button
              key={index}
              onClick={() => addGoal(goal)}
              className="btn-primary px-4 py-2 rounded-lg hover:brightness-110 transition"
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div className="surface card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Goal Coach Chat</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-sm font-medium">{coachPrompts[coachIndex].q}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {coachPrompts[coachIndex].options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setCoachReply(option);
                  setCoachIndex((prev) => (prev + 1) % coachPrompts.length);
                }}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs hover:bg-[var(--surface-3)]"
              >
                {option}
              </button>
            ))}
          </div>
          {coachReply && <p className="mt-2 text-xs text-muted">Last reply: {coachReply}</p>}
        </div>
      </div>

      <div className="surface card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Friendly Challenges</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {challengeTemplates.map((challenge) => {
            const active = activeChallenges.find((item) => item.id === challenge.id);
            return (
              <div key={challenge.id} className="rounded-xl border border-[var(--border)] p-3">
                <p className="font-medium text-sm">{challenge.title}</p>
                <p className="mt-1 text-xs text-muted">Target: {challenge.target} days</p>
                {!active ? (
                  <button
                    type="button"
                    onClick={() => startChallenge(challenge)}
                    className="mt-3 rounded-lg border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--surface-2)]"
                  >
                    Start Challenge
                  </button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted">
                      Progress: {active.progress}/{active.target}
                    </p>
                    <button
                      type="button"
                      onClick={() => advanceChallenge(challenge.id)}
                      disabled={active.completed}
                      className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs disabled:opacity-50"
                    >
                      {active.completed ? "Completed" : "Mark Today Done"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Goal */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Create Custom Goal</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="Enter custom goal"
            className="input flex-1 p-3 rounded-lg focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
          />
          <button
            onClick={() => {
              addGoal(customGoal);
              setCustomGoal("");
            }}
            className="btn-success px-5 py-2 rounded-lg hover:brightness-110 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Goal List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Goals</h2>

        {goals.length === 0 ? (
          <p className="text-muted">No goals yet</p>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="flex justify-between items-center p-4 surface card mb-3"
            >
              <span className={goal.completed ? "line-through text-soft" : ""}>
                {goal.text}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className="btn-success px-3 py-1 rounded hover:brightness-110 transition"
                >
                  {goal.completed ? "Undo" : "Done"}
                </button>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="btn-danger px-3 py-1 rounded hover:brightness-110 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
