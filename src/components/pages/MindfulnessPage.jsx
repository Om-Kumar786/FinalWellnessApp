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

            // increment mindfulness session
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
  }, [isRunning]);

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
    <div className="relative min-h-screen">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-white/70" />

      <div className="relative z-10 p-8 max-w-5xl mx-auto space-y-10">

        <h1 className="text-3xl font-semibold">
          Mindfulness & Meditation
        </h1>

        {/* Timer Card */}
        <div className="bg-white rounded-xl p-8 shadow border text-center space-y-6">

          <h2 className="text-xl font-semibold">
            Meditation Timer
          </h2>

          <div className="text-5xl font-bold">
            {formatTime()}
          </div>

          {/* Preset Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            {[5, 10, 15, 20, 30].map((min) => (
              <button
                key={min}
                onClick={() => setTime(min)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                {min} min
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsRunning(true)}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600"
            >
              Start
            </button>

            <button
              onClick={resetTimer}
              className="border px-6 py-2 rounded-lg hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Ambient Sounds */}
        <div className="bg-white rounded-xl p-6 shadow border space-y-6">

          <h3 className="text-lg font-semibold">
            Ambient Sounds
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
        className="w-full p-4 border rounded-lg hover:bg-gray-100"
      >
        {playing ? "Stop" : "Play"} {label}
      </button>
      <audio ref={audioRef} src={src} loop />
    </div>
  );
}