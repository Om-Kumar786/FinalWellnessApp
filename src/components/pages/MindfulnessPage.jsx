import { useEffect, useMemo, useRef, useState } from "react";

const BREATH_TICK_MS = 100;

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

const userStates = ["Stressed", "Distracted", "Tired", "Calm"];

const journeyTemplates = [
  { id: "reset-2", title: "2-Min Reset", minutes: 2, for: "Stressed" },
  { id: "focus-5", title: "Before Exam Focus", minutes: 5, for: "Distracted" },
  { id: "sleep-7", title: "Pre-sleep Unwind", minutes: 7, for: "Tired" },
  { id: "maintain-4", title: "Calm Maintenance", minutes: 4, for: "Calm" },
];

const breathingPatterns = {
  "4-4": [
    { phase: "inhale", seconds: 4 },
    { phase: "exhale", seconds: 4 },
  ],
  "4-7-8": [
    { phase: "inhale", seconds: 4 },
    { phase: "hold", seconds: 7 },
    { phase: "exhale", seconds: 8 },
  ],
  box: [
    { phase: "inhale", seconds: 4 },
    { phase: "hold", seconds: 4 },
    { phase: "exhale", seconds: 4 },
    { phase: "hold", seconds: 4 },
  ],
};

const microPrompts = [
  "Relax your shoulders.",
  "Unclench your jaw.",
  "Soften your gaze.",
  "Slow your exhale.",
  "Let your breath settle.",
];

const reflectionChoices = ["Lighter", "Focused", "Still stressed", "Sleepy", "Calm"];

const formatClock = (secondsLeft) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const getSuggestedJourney = (state) => {
  return journeyTemplates.find((journey) => journey.for === state) || journeyTemplates[0];
};

const getRecommendation = ({ selectedState, stressDelta, focusDelta, sessionsThisWeek }) => {
  if (selectedState === "Stressed" || stressDelta < 0) {
    return "Try 4-7-8 breathing for 5 minutes tonight. Longer exhale can help downshift stress.";
  }
  if (selectedState === "Distracted" || focusDelta > 0) {
    return "You respond well to short focus sessions. Repeat a 2-5 minute reset before demanding tasks.";
  }
  if (selectedState === "Tired") {
    return "Choose pre-sleep unwind sessions and reduce late screen stimulation.";
  }
  if (sessionsThisWeek >= 4) {
    return "Strong consistency this week. Keep your current routine and lock your session timing.";
  }
  return "Build momentum with one short mindfulness session daily at the same time.";
};

export default function MindfulnessPage({ data, setData }) {
  const [selectedState, setSelectedState] = useState("Calm");
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [journeyId, setJourneyId] = useState("maintain-4");
  const [stressBefore, setStressBefore] = useState(5);
  const [stressAfter, setStressAfter] = useState(5);
  const [focusBefore, setFocusBefore] = useState(5);
  const [focusAfter, setFocusAfter] = useState(5);
  const [reflection, setReflection] = useState("");
  const [reflectionNote, setReflectionNote] = useState("");

  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPattern, setBreathingPattern] = useState("4-4");
  const [breathingDurationMinutes, setBreathingDurationMinutes] = useState(2);
  const [breathingTimeLeftMs, setBreathingTimeLeftMs] = useState(120000);
  const [breathTickInPhase, setBreathTickInPhase] = useState(0);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);

  const [trackPlayback, setTrackPlayback] = useState(() =>
    ambientTracks.reduce((map, track) => ({ ...map, [track.id]: false }), {}),
  );
  const [trackVolume, setTrackVolume] = useState(() =>
    ambientTracks.reduce((map, track) => ({ ...map, [track.id]: 40 }), {}),
  );

  const timerRef = useRef(null);
  const breathingTimerRef = useRef(null);
  const audioRefs = useRef({});

  const mindfulnessHistory = useMemo(
    () => data?.mindfulnessHistory || [],
    [data?.mindfulnessHistory],
  );
  const sessionsThisWeek = mindfulnessHistory.length;
  const recommendedJourney = getSuggestedJourney(selectedState);
  const selectedJourney =
    journeyTemplates.find((journey) => journey.id === journeyId) || journeyTemplates[0];

  useEffect(() => {
    if (!isRunning) return undefined;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          const sessionLog = {
            at: new Date().toISOString(),
            journeyId,
            state: selectedState,
            durationMinutes: selectedJourney.minutes,
          };
          setData((prevData) => ({
            ...prevData,
            mindfulnessSessions: (prevData.mindfulnessSessions || 0) + 1,
            mindfulnessHistory: [...(prevData.mindfulnessHistory || []), sessionLog].slice(-60),
          }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, journeyId, selectedJourney.minutes, selectedState, setData]);

  useEffect(() => {
    if (!breathingActive) {
      clearInterval(breathingTimerRef.current);
      return undefined;
    }

    const activePattern = breathingPatterns[breathingPattern];
    const activePhase = activePattern[breathPhaseIndex];
    const activePhaseTicks = (activePhase.seconds * 1000) / BREATH_TICK_MS;

    breathingTimerRef.current = setInterval(() => {
      setBreathTickInPhase((prev) => {
        const next = prev + 1;
        if (next >= activePhaseTicks) {
          setBreathPhaseIndex((phasePrev) => (phasePrev + 1) % activePattern.length);
          return 0;
        }
        return next;
      });
      setBreathingTimeLeftMs((prev) => {
        if (prev <= BREATH_TICK_MS) {
          clearInterval(breathingTimerRef.current);
          setBreathingActive(false);
          setBreathTickInPhase(0);
          return 0;
        }
        return prev - BREATH_TICK_MS;
      });
    }, BREATH_TICK_MS);

    return () => clearInterval(breathingTimerRef.current);
  }, [breathPhaseIndex, breathingActive, breathingPattern]);

  useEffect(() => {
    const audios = audioRefs.current;
    return () => {
      clearInterval(timerRef.current);
      clearInterval(breathingTimerRef.current);
      Object.values(audios).forEach((audio) => {
        if (!audio) return;
        audio.pause();
      });
    };
  }, []);

  const currentPattern = breathingPatterns[breathingPattern];
  const currentPhase = currentPattern[breathPhaseIndex];
  const phaseTicks = (currentPhase.seconds * 1000) / BREATH_TICK_MS;
  const phaseProgress = Math.min(breathTickInPhase / Math.max(phaseTicks - 1, 1), 1);
  const circleSize =
    currentPhase.phase === "inhale"
      ? 50 + 120 * phaseProgress
      : currentPhase.phase === "exhale"
        ? 170 - 120 * phaseProgress
        : 110;

  const activePromptIndex = useMemo(() => {
    if (!isRunning) return 0;
    return (Math.floor((selectedJourney.minutes * 60 - secondsLeft) / 20) + breathPhaseIndex) % microPrompts.length;
  }, [breathPhaseIndex, isRunning, secondsLeft, selectedJourney.minutes]);

  const stressDelta = stressAfter - stressBefore;
  const focusDelta = focusAfter - focusBefore;
  const recommendation = getRecommendation({
    selectedState,
    stressDelta,
    focusDelta,
    sessionsThisWeek,
  });

  const todayKey = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const streak = useMemo(() => {
    const days = [...new Set(mindfulnessHistory.map((entry) => entry.at).filter(Boolean).map((dateText) => {
      const d = new Date(dateText);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }))].sort((a, b) => b - a);

    let count = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < days.length; i += 1) {
      if (days[i] === cursor.getTime()) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (days[i] < cursor.getTime()) {
        break;
      }
    }
    return count;
  }, [mindfulnessHistory]);

  const applyJourney = (journey) => {
    setJourneyId(journey.id);
    setSecondsLeft(journey.minutes * 60);
    setIsRunning(false);
  };

  const toggleTrack = async (trackId) => {
    const audio = audioRefs.current[trackId];
    if (!audio) return;
    if (trackPlayback[trackId]) {
      audio.pause();
      setTrackPlayback((prev) => ({ ...prev, [trackId]: false }));
      return;
    }
    try {
      await audio.play();
      setTrackPlayback((prev) => ({ ...prev, [trackId]: true }));
    } catch {
      setTrackPlayback((prev) => ({ ...prev, [trackId]: false }));
    }
  };

  const updateVolume = (trackId, value) => {
    const nextVolume = Number(value);
    const audio = audioRefs.current[trackId];
    if (audio) {
      audio.volume = nextVolume / 100;
    }
    setTrackVolume((prev) => ({ ...prev, [trackId]: nextVolume }));
  };

  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathTickInPhase(0);
      setBreathPhaseIndex(0);
      setBreathingTimeLeftMs(breathingDurationMinutes * 60 * 1000);
      return;
    }
    setBreathTickInPhase(0);
    setBreathPhaseIndex(0);
    setBreathingTimeLeftMs(breathingDurationMinutes * 60 * 1000);
    setBreathingActive(true);
  };

  const saveReflection = () => {
    if (!reflection && !reflectionNote.trim()) return;
    setData((prev) => ({
      ...prev,
      mindfulnessReflection: {
        day: todayKey,
        feeling: reflection,
        note: reflectionNote.trim(),
        at: new Date().toISOString(),
      },
    }));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <h1 className="text-3xl font-semibold">Mindfulness and Meditation</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Choose Your Current State</h2>
          <div className="flex flex-wrap gap-2">
            {userStates.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setSelectedState(state)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  selectedState === state
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--surface-2)]"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
          <div className="rounded-lg accent-soft p-3 text-sm">
            Suggested session: <span className="font-semibold">{recommendedJourney.title}</span> (
            {recommendedJourney.minutes} min)
          </div>
        </section>

        <section className="surface card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Session Journeys</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {journeyTemplates.map((journey) => (
              <button
                key={journey.id}
                type="button"
                onClick={() => applyJourney(journey)}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  journeyId === journey.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface-2)]"
                }`}
              >
                <p className="font-medium">{journey.title}</p>
                <p className="text-xs text-muted">{journey.minutes} min</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="surface card space-y-6 p-8 text-center">
        <h2 className="text-sm tracking-wide text-muted">Meditation Timer</h2>
        <div className="accent-text text-6xl font-bold">{formatClock(secondsLeft)}</div>
        <p className="text-muted">Sessions completed: {data?.mindfulnessSessions || 0}</p>
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
          Prompt: {microPrompts[activePromptIndex]}
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsRunning(true)}
            className="btn-primary rounded-lg px-6 py-2"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(selectedJourney.minutes * 60);
            }}
            className="btn-ghost rounded-lg px-6 py-2"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface card space-y-4 p-6">
          <h3 className="text-lg font-semibold">Before and After Check-in</h3>
          <SliderRow label="Stress before" value={stressBefore} onChange={setStressBefore} />
          <SliderRow label="Stress after" value={stressAfter} onChange={setStressAfter} />
          <SliderRow label="Focus before" value={focusBefore} onChange={setFocusBefore} />
          <SliderRow label="Focus after" value={focusAfter} onChange={setFocusAfter} />
          <div className="rounded-lg accent-soft p-3 text-sm">
            Stress change: {stressDelta > 0 ? "+" : ""}{stressDelta} | Focus change:{" "}
            {focusDelta > 0 ? "+" : ""}{focusDelta}
          </div>
        </section>

        <section className="surface card space-y-4 p-6">
          <h3 className="text-lg font-semibold">Streak and Rewards</h3>
          <p className="text-sm">Current streak: <span className="font-semibold">{streak}</span> day(s)</p>
          <p className="text-sm">This week sessions: <span className="font-semibold">{sessionsThisWeek}</span></p>
          <div className="rounded-lg border border-emerald-400 bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-200">
            {streak >= 3
              ? "Consistency badge unlocked. Keep your routine."
              : "Complete sessions on consecutive days to unlock your consistency badge."}
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
            Personalized recommendation: {recommendation}
          </div>
        </section>
      </div>

      <section className="surface card space-y-4 p-6">
        <h3 className="text-lg font-semibold">Ambient Sound Mixer</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {ambientTracks.map((track) => (
            <div key={track.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{track.label}</p>
                <button
                  type="button"
                  onClick={() => toggleTrack(track.id)}
                  className="rounded-md border border-[var(--border)] px-3 py-1 text-xs"
                >
                  {trackPlayback[track.id] ? "Pause" : "Play"}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={trackVolume[track.id]}
                onChange={(e) => updateVolume(track.id, e.target.value)}
                className="mt-2 w-full"
              />
              <audio
                ref={(node) => {
                  audioRefs.current[track.id] = node;
                }}
                src={track.src}
                loop
                preload="none"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="surface card space-y-5 p-8 text-center">
        <h3 className="text-lg font-semibold">Adaptive Breathing Coach</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {Object.keys(breathingPatterns).map((patternKey) => (
            <button
              key={patternKey}
              type="button"
              disabled={breathingActive}
              onClick={() => setBreathingPattern(patternKey)}
              className={`rounded-full border px-3 py-1 text-sm ${
                breathingPattern === patternKey
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)]"
              } ${breathingActive ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {patternKey}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {[1, 2, 5].map((minutes) => (
            <button
              key={minutes}
              type="button"
              disabled={breathingActive}
              onClick={() => {
                setBreathingDurationMinutes(minutes);
                if (!breathingActive) setBreathingTimeLeftMs(minutes * 60 * 1000);
              }}
              className={`rounded-lg border px-4 py-2 text-sm ${
                breathingDurationMinutes === minutes
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)]"
              } ${breathingActive ? "cursor-not-allowed opacity-50" : "hover:bg-[var(--surface-2)]"}`}
            >
              {minutes} min
            </button>
          ))}
        </div>

        <p className="text-sm text-muted">
          Phase: {currentPhase.phase.toUpperCase()} ({currentPhase.seconds}s) | Time left:{" "}
          {formatClock(Math.ceil(breathingTimeLeftMs / 1000))}
        </p>

        <div className="flex justify-center">
          <div className="relative flex h-[230px] w-[230px] items-center justify-center rounded-full border-4 border-cyan-300/70 bg-cyan-100/10">
            <div
              className="flex items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                backgroundColor:
                  currentPhase.phase === "inhale"
                    ? "rgba(6, 182, 212, 0.55)"
                    : currentPhase.phase === "exhale"
                      ? "rgba(2, 132, 199, 0.42)"
                      : "rgba(14, 116, 144, 0.45)",
                transition: `width ${BREATH_TICK_MS}ms linear, height ${BREATH_TICK_MS}ms linear, background-color ${BREATH_TICK_MS}ms linear`,
              }}
            >
              {currentPhase.phase.toUpperCase()}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleBreathing}
          className={`rounded-lg px-6 py-2 text-white ${
            breathingActive ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {breathingActive ? "Stop Breathing" : "Start Breathing"}
        </button>
      </section>

      <section className="surface card space-y-4 p-6">
        <h3 className="text-lg font-semibold">Quick Reflection</h3>
        <div className="flex flex-wrap gap-2">
          {reflectionChoices.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setReflection(choice)}
              className={`rounded-full border px-3 py-1 text-sm ${
                reflection === choice
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-[var(--surface-2)]"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
        <textarea
          value={reflectionNote}
          onChange={(e) => setReflectionNote(e.target.value)}
          placeholder="Optional note..."
          className="input min-h-20 w-full rounded-lg p-3 text-sm"
        />
        <button
          type="button"
          onClick={saveReflection}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Save Reflection
        </button>
      </section>
    </div>
  );
}

function SliderRow({ label, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}: {value}</span>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
