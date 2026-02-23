export default function SleepLog({ data, setData }) {
  const goal = 8;
  const sleepHours = data.sleepHours || 0;
  const percentage = Math.min((sleepHours / goal) * 100, 100);

  const handleSleep = (hours) => {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "short",
    });

    setData((prev) => ({
      ...prev,
      sleepHours: hours,
      sleepHistory: [
        ...prev.sleepHistory.filter((s) => s.day !== today),
        { day: today, hours },
      ],
    }));
  };

  const sleepMessage =
    sleepHours >= 8
      ? "🌟 Excellent! You reached your sleep goal!"
      : sleepHours >= 6
      ? "🙂 Good job! Try aiming for 8 hours."
      : sleepHours > 0
      ? "😴 Try getting more rest tonight."
      : "Log your sleep to see insights.";

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">

      <h1 className="text-3xl font-semibold">Sleep Log 🌙</h1>

      {/* Main Sleep Card */}
      <div className="bg-white rounded-2xl p-8 shadow-md border space-y-6 text-center">

        <p className="text-gray-500 text-sm">Last Logged Sleep</p>

        <h2 className="text-6xl font-bold text-indigo-600">
          {sleepHours} hrs
        </h2>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-4 rounded-full mt-4">
          <div
            className="bg-indigo-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {percentage.toFixed(0)}% of 8 hour goal
        </p>

        <p className="mt-4 font-medium text-gray-700">
          {sleepMessage}
        </p>
      </div>

      {/* Quick Select Buttons */}
      <div className="bg-white rounded-2xl p-6 shadow-md border space-y-4">

        <p className="font-medium text-gray-600">
          Quick Log
        </p>

        <div className="flex gap-4 flex-wrap">
          {[5, 6, 7, 8, 9].map((hrs) => (
            <button
              key={hrs}
              onClick={() => handleSleep(hrs)}
              className={`px-4 py-2 rounded-lg border transition ${
                sleepHours === hrs
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {hrs} hrs
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input */}
      <div className="bg-white rounded-2xl p-6 shadow-md border space-y-4">

        <p className="font-medium text-gray-600">
          Enter Custom Hours
        </p>

        <input
          type="number"
          value={sleepHours}
          onChange={(e) => handleSleep(Number(e.target.value))}
          className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
          placeholder="Enter sleep hours"
        />
      </div>

      {/* Weekly Summary */}
      {data.sleepHistory?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-md border">
          <h3 className="font-semibold mb-4">
            Weekly Sleep Summary
          </h3>

          <div className="grid grid-cols-7 gap-3 text-center">
            {data.sleepHistory.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-indigo-50 rounded-lg"
              >
                <p className="text-sm text-gray-500">
                  {item.day}
                </p>
                <p className="font-semibold">
                  {item.hours}h
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}