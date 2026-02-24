import { useEffect, useMemo, useState } from "react";

const activityVideos = [
  {
    id: "v7AYKMP6rOE",
    title: "10-Minute Morning Yoga",
    channel: "Yoga With Adriene",
    type: "yoga",
    level: "beginner",
    duration: 10,
  },
  {
    id: "4pKly2JojMw",
    title: "Yoga For Complete Beginners",
    channel: "Yoga With Adriene",
    type: "yoga",
    level: "beginner",
    duration: 20,
  },
  {
    id: "sTANio_2E0Q",
    title: "15-Minute Full Body Stretch",
    channel: "Boho Beautiful Yoga",
    type: "yoga",
    level: "intermediate",
    duration: 15,
  },
  {
    id: "ml6cT4AZdqI",
    title: "20-Minute Full Body Workout",
    channel: "MadFit",
    type: "exercise",
    level: "intermediate",
    duration: 20,
  },
  {
    id: "UItWltVZZmE",
    title: "Low Impact Cardio Workout",
    channel: "HASfit",
    type: "exercise",
    level: "beginner",
    duration: 18,
  },
  {
    id: "gC_L9qAHVJ8",
    title: "Beginner Bodyweight Workout",
    channel: "SELF",
    type: "exercise",
    level: "beginner",
    duration: 22,
  },
];

const filterOptions = {
  type: [
    { key: "all", label: "All" },
    { key: "yoga", label: "Yoga" },
    { key: "exercise", label: "Exercise" },
  ],
  level: [
    { key: "all", label: "All Levels" },
    { key: "beginner", label: "Beginner" },
    { key: "intermediate", label: "Intermediate" },
  ],
  duration: [
    { key: "all", label: "Any Duration" },
    { key: "short", label: "0-10 min" },
    { key: "medium", label: "11-20 min" },
    { key: "long", label: "20+ min" },
  ],
};

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const matchesDuration = (duration, filter) => {
  if (filter === "all") return true;
  if (filter === "short") return duration <= 10;
  if (filter === "medium") return duration > 10 && duration <= 20;
  return duration > 20;
};

export default function ActivityPage({ data, setData }) {
  const goal = 10000;
  const percentage = Math.min((data.steps / goal) * 100, 100);
  const username = localStorage.getItem("user") || "guest";
  const prefKey = `activityVideoPrefs_${username}`;

  const [filters, setFilters] = useState({
    type: "all",
    level: "all",
    duration: "all",
  });

  const [videoPrefs, setVideoPrefs] = useState(() =>
    parseJSON(localStorage.getItem(prefKey), { watched: {}, favorites: {} }),
  );

  useEffect(() => {
    localStorage.setItem(prefKey, JSON.stringify(videoPrefs));
  }, [prefKey, videoPrefs]);

  const filteredVideos = useMemo(() => {
    return activityVideos.filter((video) => {
      const typeMatch = filters.type === "all" || video.type === filters.type;
      const levelMatch = filters.level === "all" || video.level === filters.level;
      const durationMatch = matchesDuration(video.duration, filters.duration);
      return typeMatch && levelMatch && durationMatch;
    });
  }, [filters]);

  const handleChange = (e) => {
    const value = Number(e.target.value);
    setData({
      ...data,
      steps: value,
    });
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFavorite = (videoId) => {
    setVideoPrefs((prev) => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        [videoId]: !prev.favorites[videoId],
      },
    }));
  };

  const toggleWatched = (videoId) => {
    setVideoPrefs((prev) => ({
      ...prev,
      watched: {
        ...prev.watched,
        [videoId]: !prev.watched[videoId],
      },
    }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-3xl font-semibold">Activity Tracking</h1>

      <div className="surface card p-8 text-center">
        <p className="text-sm text-muted">Current Steps</p>
        <h2 className="accent-text mt-4 text-5xl font-bold">{data.steps}</h2>

        <div className="mt-6 h-3 rounded-full bg-[var(--surface-3)]">
          <div
            className="h-3 rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-muted">{percentage.toFixed(0)}% of 10,000 steps goal</p>
      </div>

      <div className="surface card p-6">
        <label className="mb-3 block text-muted">Update Steps</label>
        <input
          type="number"
          value={data.steps}
          onChange={handleChange}
          className="input w-full rounded-lg p-3 transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder="Enter today's steps"
        />
      </div>

      <div className="accent-soft accent-text rounded-xl p-4 text-center">
        {percentage >= 100
          ? "Amazing! You reached your goal!"
          : "Keep going! Every step counts."}
      </div>

      <section className="surface card space-y-5 p-6">
        <div>
          <h2 className="text-2xl font-semibold">Health Video Library</h2>
          <p className="text-sm text-muted">
            Filter by type, level and duration. Mark watched or save favorites.
          </p>
        </div>

        <FilterGroup
          title="Type"
          options={filterOptions.type}
          selected={filters.type}
          onChange={(value) => updateFilter("type", value)}
        />
        <FilterGroup
          title="Level"
          options={filterOptions.level}
          selected={filters.level}
          onChange={(value) => updateFilter("level", value)}
        />
        <FilterGroup
          title="Duration"
          options={filterOptions.duration}
          selected={filters.duration}
          onChange={(value) => updateFilter("duration", value)}
        />

        {filteredVideos.length === 0 ? (
          <p className="rounded-lg border border-[var(--border)] p-4 text-sm text-muted">
            No videos match current filters. Try a different level or duration.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => {
              const isFavorite = Boolean(videoPrefs.favorites[video.id]);
              const isWatched = Boolean(videoPrefs.watched[video.id]);

              return (
                <article
                  key={video.id}
                  className={`rounded-xl border p-3 shadow-md transition hover:-translate-y-1 ${
                    isFavorite
                      ? "border-amber-400 bg-amber-50 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"
                      : "border-[#e5d58a] bg-[#fff6be] text-[#2d2a1f] dark:border-[#8a7a31] dark:bg-[#3f3412] dark:text-[#f9f2cc]"
                  }`}
                >
                  <div className="overflow-hidden rounded-md border border-black/10">
                    <iframe
                      title={video.title}
                      src={`https://www.youtube.com/embed/${video.id}`}
                      className="w-full"
                      style={{ aspectRatio: "16 / 10" }}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold">{video.title}</h3>
                  <p className="text-xs opacity-80">{video.channel}</p>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-black/10 px-2 py-1 uppercase">{video.type}</span>
                    <span className="rounded-full bg-black/10 px-2 py-1 capitalize">{video.level}</span>
                    <span className="rounded-full bg-black/10 px-2 py-1">{video.duration} min</span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(video.id)}
                      className={`rounded-md px-2 py-1 text-xs ${
                        isFavorite
                          ? "bg-amber-500 text-white"
                          : "border border-black/20 bg-transparent"
                      }`}
                    >
                      {isFavorite ? "Favorited" : "Favorite"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleWatched(video.id)}
                      className={`rounded-md px-2 py-1 text-xs ${
                        isWatched
                          ? "bg-emerald-600 text-white"
                          : "border border-black/20 bg-transparent"
                      }`}
                    >
                      {isWatched ? "Watched" : "Mark watched"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterGroup({ title, options, selected, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-[var(--surface-2)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
