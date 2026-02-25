import { useMemo, useState } from "react";
import { Bot, MessageCircleQuestion, RotateCcw, Sparkles } from "lucide-react";

const moodCards = [
  { label: "Great", emoji: "Great", symbol: ":-)", color: "bg-emerald-500" },
  { label: "Good", emoji: "Good", symbol: ":)", color: "bg-sky-500" },
  { label: "Okay", emoji: "Okay", symbol: ":|", color: "bg-amber-500" },
  { label: "Stressed", emoji: "Stressed", symbol: ":(", color: "bg-rose-500" },
];

const chatbotQuestions = [
  {
    id: "energy",
    prompt: "How is your energy right now?",
    options: [
      { label: "Very low", scores: { Stressed: 2, Okay: 1 } },
      { label: "Normal", scores: { Okay: 2, Good: 1 } },
      { label: "High", scores: { Good: 2, Great: 2 } },
    ],
  },
  {
    id: "stress",
    prompt: "How stressful does today feel?",
    options: [
      { label: "Overwhelming", scores: { Stressed: 3 } },
      { label: "Manageable", scores: { Okay: 2, Good: 1 } },
      { label: "Calm", scores: { Great: 2, Good: 1 } },
    ],
  },
  {
    id: "focus",
    prompt: "How focused have you felt today?",
    options: [
      { label: "Distracted", scores: { Stressed: 2, Okay: 1 } },
      { label: "On and off", scores: { Okay: 2 } },
      { label: "Locked in", scores: { Great: 2, Good: 2 } },
    ],
  },
  {
    id: "social",
    prompt: "How connected do you feel with people today?",
    options: [
      { label: "Isolated", scores: { Stressed: 2, Okay: 1 } },
      { label: "Neutral", scores: { Okay: 2, Good: 1 } },
      { label: "Connected", scores: { Great: 2, Good: 2 } },
    ],
  },
];

const createEmptyScore = () => ({
  Great: 0,
  Good: 0,
  Okay: 0,
  Stressed: 0,
});

const getMoodSymbol = (label) =>
  moodCards.find((mood) => mood.label === label)?.symbol || "-";

const getSuggestedMood = (scoreMap) => {
  return Object.entries(scoreMap).sort((a, b) => b[1] - a[1])[0][0];
};

export default function MoodTracker({ data, setData }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [scoreMap, setScoreMap] = useState(createEmptyScore);
  const [chatLog, setChatLog] = useState([]);

  const currentQuestion = chatbotQuestions[stepIndex];
  const isComplete = stepIndex >= chatbotQuestions.length;
  const suggestedMood = useMemo(() => getSuggestedMood(scoreMap), [scoreMap]);

  const saveMood = (mood) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
    setData((prev) => ({
      ...prev,
      mood,
      moodHistory: [...prev.moodHistory.filter((entry) => entry.day !== today), { day: today, mood }],
    }));
  };

  const handleOptionSelect = (option) => {
    setChatLog((prev) => [
      ...prev,
      { type: "bot", text: currentQuestion.prompt },
      { type: "user", text: option.label },
    ]);

    setScoreMap((prev) => {
      const next = { ...prev };
      Object.entries(option.scores).forEach(([mood, value]) => {
        next[mood] += value;
      });
      return next;
    });

    setStepIndex((prev) => prev + 1);
  };

  const resetChatbot = () => {
    setStepIndex(0);
    setScoreMap(createEmptyScore());
    setChatLog([]);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 lg:p-8">
      <h1 className="text-3xl font-semibold">Mood Tracking</h1>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="surface card space-y-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Chat Assistant</p>
              <h2 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                <Bot size={22} />
                Mood Check-in Bot
              </h2>
            </div>
            <button
              type="button"
              onClick={resetChatbot}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-2)]"
            >
              <RotateCcw size={16} />
              Restart
            </button>
          </div>

          <div className="surface-2 max-h-80 space-y-3 overflow-y-auto rounded-2xl p-4">
            {chatLog.length === 0 && (
              <p className="text-sm text-muted">
                I will ask a few quick questions and suggest your likely mood.
              </p>
            )}

            {chatLog.map((message, index) => (
              <div
                key={`${message.type}-${index}`}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                  message.type === "bot"
                    ? "surface border border-[var(--border)]"
                    : "ml-auto bg-[var(--accent)] text-white"
                }`}
              >
                {message.text}
              </div>
            ))}

            {!isComplete && (
              <div className="surface rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                {currentQuestion.prompt}
              </div>
            )}
          </div>

          {!isComplete ? (
            <div className="grid gap-3 md:grid-cols-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5 hover:bg-[var(--surface-2)]"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="surface-2 rounded-2xl border border-[var(--border)] p-5">
              <p className="text-sm text-muted">Suggested by chatbot</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                <Sparkles size={20} className="text-[var(--accent)]" />
                {getMoodSymbol(suggestedMood)} {suggestedMood}
              </p>
              <button
                type="button"
                onClick={() => saveMood(suggestedMood)}
                className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Save Suggested Mood
              </button>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="surface card p-6 text-center">
            <p className="text-sm text-muted">Today's Mood</p>
            <h2 className="mt-3 text-4xl font-bold">
              {data.mood ? `${getMoodSymbol(data.mood)} ${data.mood}` : "Not Selected"}
            </h2>
          </div>

          <div className="surface card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <MessageCircleQuestion size={18} />
              Manual Override
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {moodCards.map((mood) => (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => saveMood(mood.label)}
                  className={`rounded-xl px-4 py-3 text-left transition ${
                    data.mood === mood.label
                      ? `${mood.color} text-white shadow-soft`
                      : "surface-2 hover:bg-[var(--surface-3)]"
                  }`}
                >
                  <p className="text-lg">{mood.symbol}</p>
                  <p className="text-sm font-medium">{mood.label}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {data.moodHistory?.length > 0 && (
        <section className="surface card p-6">
          <h3 className="mb-4 font-semibold">Weekly Mood Overview</h3>
          <div className="grid grid-cols-4 gap-3 text-center md:grid-cols-7">
            {data.moodHistory.map((item, index) => (
              <div key={`${item.day}-${index}`} className="accent-soft rounded-lg p-3">
                <p className="text-sm text-muted">{item.day}</p>
                <p className="text-xl">{getMoodSymbol(item.mood)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
