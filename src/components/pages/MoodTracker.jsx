export default function MoodTracker({ data, setData }) {
  const moods = ["Great", "Good", "Okay", "Stressed"];

  const handleMoodClick = (mood) => {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "short",
    });

    setData((prev) => ({
      ...prev,
      mood: mood,
      moodHistory: [
        ...prev.moodHistory.filter((item) => item.day !== today),
        { day: today, mood: mood },
      ],
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Daily Mood</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {moods.map((mood) => (
          <button
            key={mood}
            onClick={() => handleMoodClick(mood)}
            className={`rounded-xl p-6 border transition ${
              data.mood === mood
                ? "bg-indigo-500 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}