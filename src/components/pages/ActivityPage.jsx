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
      <div className="bg-white rounded-2xl p-8 shadow-md border text-center">
        <p className="text-gray-500 text-sm">
          Current Steps
        </p>

        <h2 className="text-5xl font-bold mt-4 text-indigo-600">
          {data.steps}
        </h2>

        {/* Progress Bar */}
        <div className="mt-6 bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {percentage.toFixed(0)}% of 10,000 steps goal
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md border">
        <label className="block mb-3 text-gray-600">
          Update Steps
        </label>

        <input
          type="number"
          value={data.steps}
          onChange={handleChange}
          className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
          placeholder="Enter today's steps"
        />
      </div>

      {/* Motivation */}
      <div className="bg-indigo-50 rounded-xl p-4 text-center text-indigo-700">
        {percentage >= 100
          ? "🔥 Amazing! You reached your goal!"
          : "Keep going! Every step counts 💪"}
      </div>

    </div>
  );
}