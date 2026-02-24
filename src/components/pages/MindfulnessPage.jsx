import { useEffect, useRef, useState } from "react";

const SOUND_FEEDBACK_MS = 1200;
const BREATH_PHASE_SECONDS = 6;
const BREATH_TICK_MS = 100;
const PHASE_TICKS = (BREATH_PHASE_SECONDS * 1000) / BREATH_TICK_MS;

const ambientTracks = [
  {
    id: "ocean",
    label: "Ocean Waves",
    src: "https://orangefreesounds.com/wp-content/uploads/2015/06/Ocean-waves-sound.mp3",
  },
  {
    id: "rain",
    label: "Rain Sounds",
    src: "https://orangefreesounds.com/wp-content/uploads/2014/08/Rain-sound-effect.mp3",
  },
  {
    id: "birds",
    label: "Forest Birds",
    src: "https://orangefreesounds.com/wp-content/uploads/2015/04/Birds-chirping-sound.mp3",
  },
  {
    id: "fire",
    label: "Crackling Fire",
    src: "https://orangefreesounds.com/wp-content/uploads/2014/08/Fireplace-sound-effect.mp3",
  },
];

export default function MindfulnessPage({ data, setData }) {
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [trackStatus, setTrackStatus] = useState({});
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingTick, setBreathingTick] = useState(0);
  const [breathingDurationMinutes, setBreathingDurationMinutes] = useState(2);
  const [breathingTimeLeftMs, setBreathingTimeLeftMs] = useState(120000);

  const intervalRef = useRef(null);
  const breathingIntervalRef = useRef(null);
  const audioRef = useRef(null);
  const clearTimersRef = useRef({});

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
                mindfulnessSessions: (prevData.mindfulnessSessions || 0) + 1,
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

  useEffect(() => {
    if (!breathingActive) {
      clearInterval(breathingIntervalRef.current);
      return undefined;
    }

    breathingIntervalRef.current = setInterval(() => {
      setBreathingTick((prev) => prev + 1);

      setBreathingTimeLeftMs((prev) => {
        if (prev <= BREATH_TICK_MS) {
          clearInterval(breathingIntervalRef.current);
          setBreathingActive(false);
          setBreathingTick(0);
          return 0;
        }
        return prev - BREATH_TICK_MS;
      });
    }, BREATH_TICK_MS);

    return () => clearInterval(breathingIntervalRef.current);
  }, [breathingActive]);

  useEffect(() => {
    const timers = clearTimersRef.current;
    const audioElement = audioRef.current;
    const breathingTimer = breathingIntervalRef.current;

    return () => {
      Object.values(timers).forEach((timerId) => {
        clearTimeout(timerId);
      });
      if (audioElement) {
        audioElement.pause();
      }
      clearInterval(breathingTimer);
    };
  }, []);

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

  const setStoppedState = (trackId) => {
    if (!trackId) return;

    if (clearTimersRef.current[trackId]) {
      clearTimeout(clearTimersRef.current[trackId]);
    }

    setTrackStatus((prev) => ({ ...prev, [trackId]: "stopped" }));

    clearTimersRef.current[trackId] = setTimeout(() => {
      setTrackStatus((prev) => ({ ...prev, [trackId]: "default" }));
      clearTimersRef.current[trackId] = null;
    }, SOUND_FEEDBACK_MS);
  };

  const playTrack = async (track) => {
    if (!audioRef.current) return;

    const previouslyActive = activeTrackId;

    if (previouslyActive === track.id) {
      audioRef.current.pause();
      setActiveTrackId(null);
      setStoppedState(track.id);
      return;
    }

    if (previouslyActive) {
      audioRef.current.pause();
      setStoppedState(previouslyActive);
    }

    audioRef.current.src = track.src;
    audioRef.current.currentTime = 0;

    try {
      await audioRef.current.play();
      setActiveTrackId(track.id);
      setTrackStatus((prev) => ({ ...prev, [track.id]: "playing" }));
    } catch {
      setActiveTrackId(null);
      setStoppedState(track.id);
    }
  };

  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathingTick(0);
      setBreathingTimeLeftMs(breathingDurationMinutes * 60 * 1000);
      return;
    }
    setBreathingTick(0);
    setBreathingTimeLeftMs(breathingDurationMinutes * 60 * 1000);
    setBreathingActive(true);
  };

  const setBreathingDuration = (minutes) => {
    setBreathingDurationMinutes(minutes);
    if (!breathingActive) {
      setBreathingTimeLeftMs(minutes * 60 * 1000);
    }
  };

  const formatBreathingTime = () => {
    const totalSeconds = Math.ceil(breathingTimeLeftMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const breathingPhase =
    Math.floor(breathingTick / PHASE_TICKS) % 2 === 0 ? "inhale" : "exhale";
  const phaseTick = breathingTick % PHASE_TICKS;
  const phaseProgress = phaseTick / (PHASE_TICKS - 1);
  const phaseSecondsLeft = Math.ceil(((PHASE_TICKS - phaseTick) * BREATH_TICK_MS) / 1000);
  const innerSize = breathingPhase === "inhale" ? 170 * phaseProgress : 170 * (1 - phaseProgress);

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-8">
      <h1 className="text-3xl font-semibold">Mindfulness and Meditation</h1>

      <div className="surface card space-y-8 p-10 text-center">
        <h2 className="text-sm tracking-wide text-muted">Meditation Timer</h2>

        <div className="accent-text text-6xl font-bold">{formatTime()}</div>

        <p className="text-muted">Sessions completed: {data?.mindfulnessSessions || 0}</p>

        <div className="flex flex-wrap justify-center gap-4">
          {[5, 10, 15, 20, 30].map((min) => (
            <button
              key={min}
              onClick={() => setTime(min)}
              className="rounded-lg border border-[var(--border)] px-4 py-2 transition hover:bg-[var(--surface-2)]"
            >
              {min} min
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsRunning(true)}
            className="btn-primary rounded-lg px-6 py-2 transition hover:brightness-110"
          >
            Start
          </button>

          <button
            onClick={resetTimer}
            className="btn-ghost rounded-lg px-6 py-2 transition hover:bg-[var(--surface-2)]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="surface card space-y-6 p-8">
        <h3 className="text-lg font-semibold">Ambient Sounds</h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ambientTracks.map((track) => (
            <SoundButton
              key={track.id}
              label={track.label}
              onClick={() => playTrack(track)}
              status={trackStatus[track.id] || "default"}
              isPlaying={activeTrackId === track.id}
            />
          ))}
        </div>
      </div>

      <div className="surface card space-y-6 p-8 text-center">
        <h3 className="text-lg font-semibold">Breathing Mini Tool</h3>
        <p className="text-sm text-muted">Session time left: {formatBreathingTime()}</p>
        <p className="text-base font-semibold text-[var(--text)]">
          {breathingPhase === "inhale" ? "Inhale" : "Exhale"} ({phaseSecondsLeft}s)
        </p>
        <p className="text-sm text-muted">
          {breathingPhase === "inhale" ? "Breathe in slowly" : "Release your breath slowly"}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {[1, 2, 5].map((min) => (
            <button
              key={min}
              type="button"
              disabled={breathingActive}
              onClick={() => setBreathingDuration(min)}
              className={`rounded-lg border px-4 py-2 text-sm ${
                breathingDurationMinutes === min
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)]"
              } ${breathingActive ? "cursor-not-allowed opacity-50" : "hover:bg-[var(--surface-2)]"}`}
            >
              {min} min
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <div
            className="relative flex h-[230px] w-[230px] items-center justify-center rounded-full border-4 border-cyan-300/80 bg-cyan-100/10"
          >
            <div
              className="flex items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{
                width: `${innerSize}px`,
                height: `${innerSize}px`,
                backgroundColor:
                  breathingPhase === "inhale" ? "rgba(6, 182, 212, 0.55)" : "rgba(2, 132, 199, 0.42)",
                transition: `width ${BREATH_TICK_MS}ms linear, height ${BREATH_TICK_MS}ms linear, background-color ${BREATH_TICK_MS}ms linear`,
              }}
            >
              {innerSize > 48 ? (breathingPhase === "inhale" ? "IN" : "OUT") : ""}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleBreathing}
            className={`rounded-lg px-6 py-2 text-white transition ${
              breathingActive ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {breathingActive ? "Stop Breathing" : "Start Breathing"}
          </button>
        </div>
      </div>

      <audio ref={audioRef} loop preload="none" />
    </div>
  );
}

function SoundButton({ label, onClick, status, isPlaying }) {
  const baseClasses =
    "w-full rounded-xl border border-[var(--border)] p-4 text-white transition duration-300";

  const stateClasses =
    status === "playing"
      ? "bg-green-600 hover:bg-green-500"
      : status === "stopped"
        ? "bg-red-600 hover:bg-red-500"
        : "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface)]";

  return (
    <div className="text-center">
      <button type="button" onClick={onClick} className={`${baseClasses} ${stateClasses}`}>
        {isPlaying ? "Stop" : "Play"} {label}
      </button>
    </div>
  );
}
