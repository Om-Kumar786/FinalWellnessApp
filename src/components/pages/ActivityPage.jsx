export default function ActivityPage({ data, setData }) {
  const goal = 10000;
  const percentage = Math.min((data.steps / goal) * 100, 100);

  const handleChange = (e) => {
    const value = Number(e.target.value);

    setData({
      ...data,
      steps: value,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <h1 className="text-3xl font-semibold">
        Activity Tracking 👟
      </h1>

      {/* Current Steps */}
      <div className="surface card p-8 text-center">
        <p className="text-muted text-sm">
          Current Steps
        </p>

        <h2 className="text-5xl font-bold mt-4 accent-text">
          {data.steps}
        </h2>

        {/* Progress Bar */}
        <div className="mt-6 bg-[var(--surface-3)] rounded-full h-3">
          <div
            className="bg-[var(--accent)] h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-muted">
          {percentage.toFixed(0)}% of 10,000 steps goal
        </p>
      </div>

      {/* Input Section */}
      <div className="surface card p-6">
        <label className="block mb-3 text-muted">
          Update Steps
        </label>

        <input
          type="number"
          value={data.steps}
          onChange={handleChange}
          className="input rounded-lg p-3 w-full focus:ring-2 focus:ring-[var(--ring)] focus:outline-none transition"
          placeholder="Enter today's steps"
        />
      </div>

      {/* Motivation */}
      <div className="accent-soft rounded-xl p-4 text-center accent-text">
        {percentage >= 100
          ? "🔥 Amazing! You reached your goal!"
          : "Keep going! Every step counts 💪"}
      </div>

    </div>
  );
}
