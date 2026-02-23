import { useState, useEffect, useRef } from "react";

export default function MindfulnessPage({ data, setData }) {
  const [secondsLeft, setSecondsLeft] = useState(600); // default 10 min
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);

  /* ================= TIMER LOGIC ================= */

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);

            if (setData) {
              setData((prevData) => ({
                ...prevData,
                mindfulnessSessions:
                  (prevData.mindfulnessSessions || 0) + 1,
              }));
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, setData]);

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const setTime = (minutes) => {
    setSecondsLeft(minutes * 60);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setSecondsLeft(600);
    setIsRunning(false);
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">

      <h1 className="text-3xl font-semibold">
        Mindfulness & Meditation 🧘
      </h1>

      {/* Timer Card */}
      <div className="surface card p-10 text-center space-y-8">

        <h2 className="text-muted text-sm tracking-wide">
          Meditation Timer
        </h2>

        {/* Large Timer Display */}
        <div className="text-6xl font-bold accent-text">
          {formatTime()}
        </div>

        {/* Sessions Counter */}
        <p className="text-muted">
          Sessions completed: {data?.mindfulnessSessions || 0}
        </p>

        {/* Preset Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          {[5, 10, 15, 20, 30].map((min) => (
            <button
              key={min}
              onClick={() => setTime(min)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] transition"
            >
              {min} min
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsRunning(true)}
            className="btn-primary px-6 py-2 rounded-lg hover:brightness-110 transition"
          >
            Start
          </button>

          <button
            onClick={resetTimer}
            className="btn-ghost px-6 py-2 rounded-lg hover:bg-[var(--surface-2)] transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Ambient Sounds */}
      <div className="surface card p-8 space-y-6">

        <h3 className="text-lg font-semibold">
          Ambient Sounds 🎧
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <SoundButton
            label="Ocean Waves"
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          />

          <SoundButton
            label="Rain Sounds"
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
          />

          <SoundButton
            label="Forest Birds"
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
          />

          <SoundButton
            label="Crackling Fire"
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
          />

        </div>
      </div>

    </div>
  );
}

/* ================= SOUND BUTTON COMPONENT ================= */

function SoundButton({ label, src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setPlaying(!playing);
  };

  return (
    <div className="text-center">
      <button
        onClick={toggleSound}
        className={`w-full p-4 rounded-xl border border-[var(--border)] transition ${
          playing
            ? "bg-[var(--accent)] text-white"
            : "hover:bg-[var(--surface-2)]"
        }`}
      >
        {playing ? "Stop" : "Play"} {label}
      </button>
      <audio ref={audioRef} src={src} loop />
    </div>
  );
}
