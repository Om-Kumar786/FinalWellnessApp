export default function MoodTracker({ data, setData }) {
  const moods = [
    { label: "Great", emoji: "😄", color: "bg-green-500" },
    { label: "Good", emoji: "🙂", color: "bg-blue-500" },
    { label: "Okay", emoji: "😐", color: "bg-yellow-500" },
    { label: "Stressed", emoji: "😣", color: "bg-red-500" },
  ];

  const handleClick = (mood) => {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "short",
    });

    setData((prev) => ({
      ...prev,
      mood,
      moodHistory: [
        ...prev.moodHistory.filter((m) => m.day !== today),
        { day: today, mood },
      ],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">

      <h1 className="text-3xl font-semibold">
        How are you feeling today?
      </h1>

      {/* Current Mood Display */}
      <div className="surface card p-8 text-center">
        <p className="text-muted text-sm">Today's Mood</p>

        <h2 className="text-5xl mt-4 font-bold">
          {data.mood ? data.mood : "Not Selected"}
        </h2>
      </div>

      {/* Mood Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {moods.map((m) => (
          <button
            key={m.label}
            onClick={() => handleClick(m.label)}
            className={`p-8 rounded-2xl transition-all duration-300 hover:scale-105 text-center ${
              data.mood === m.label
                ? `${m.color} text-white shadow-soft`
                : "surface hover:bg-[var(--surface-2)]"
            }`}
          >
            <div className="text-4xl">{m.emoji}</div>
            <p className="mt-3 font-medium">{m.label}</p>
          </button>
        ))}
      </div>

      {/* Weekly Mood Preview */}
      {data.moodHistory?.length > 0 && (
        <div className="surface card p-6">
          <h3 className="font-semibold mb-4">
            Weekly Mood Overview
          </h3>

          <div className="grid grid-cols-7 gap-3 text-center">
            {data.moodHistory.map((item, index) => (
              <div
                key={index}
                className="p-3 accent-soft rounded-lg"
              >
                <p className="text-sm text-muted">
                  {item.day}
                </p>
                <p className="text-xl">
                  {
                    moods.find((m) => m.label === item.mood)
                      ?.emoji
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
