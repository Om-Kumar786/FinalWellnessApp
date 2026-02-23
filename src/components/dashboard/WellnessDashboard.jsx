import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function WellnessDashboard({ data }) {
  const username = localStorage.getItem("user") || "User";
  const today = new Date().toLocaleDateString();

  const moodHistory = data?.moodHistory || [];
  const sleepHistory = data?.sleepHistory || [];
  const goals = data?.goals || [];

  const completed = goals.filter(g => g.completed).length;

  /* ================= WELLNESS SCORE ================= */

  const wellnessScore =
    (data.sleepHours >= 8 ? 25 : 10) +
    (data.steps >= 8000 ? 25 : 10) +
    (completed * 10);

  /* ================= MOOD CALCULATION ================= */

  const moodCount = {};
  moodHistory.forEach((item) => {
    moodCount[item.mood] = (moodCount[item.mood] || 0) + 1;
  });

  const moodColors = {
    Great: "#4ade80",
    Good: "#60a5fa",
    Okay: "#fbbf24",
    Stressed: "#f87171",
  };

  const moodData = Object.keys(moodCount).map((key) => ({
    name: key,
    value: moodCount[key],
    color: moodColors[key],
  }));

  /* ================= MOTIVATIONAL QUOTES ================= */

  const quotes = [
    "Small progress is still progress 💪",
    "Consistency beats motivation 🔥",
    "Take care of your body 🧠",
    "You are stronger than you think 💙",
  ];

  const randomQuote =
    quotes[new Date().getDate() % quotes.length];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">
            Welcome back, {username} 👋
          </h1>
          <p className="text-gray-500">{today}</p>
        </div>

        <div className="bg-white px-5 py-2 rounded-full shadow border">
          Wellness Score: <span className="font-semibold">{wellnessScore}/100</span>
        </div>
      </div>

      {/* ================= MOTIVATIONAL QUOTE ================= */}
      <div className="bg-indigo-100 p-6 rounded-xl">
        <p className="font-medium text-indigo-700">
          "{randomQuote}"
        </p>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Mood"
          value={data.mood || "Not Set"}
          icon="😊"
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Sleep"
          value={`${data.sleepHours || 0} hrs`}
          icon="🌙"
          color="from-indigo-400 to-purple-500"
        />
        <StatCard
          title="Steps"
          value={data.steps || 0}
          icon="👟"
          color="from-blue-400 to-cyan-500"
        />
        <StatCard
          title="Stress"
          value={data.stressLevel || "Low"}
          icon="⚡"
          color="from-red-400 to-orange-500"
        />
      </div>

      {/* ================= GOALS PREVIEW ================= */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="font-semibold mb-3">Goal Progress</h3>

        {goals.length > 0 ? (
          <>
            <p className="mb-3">
              {completed} of {goals.length} goals completed
            </p>

            <ul className="space-y-2">
              {goals.slice(0, 3).map((goal) => (
                <li
                  key={goal.id}
                  className="flex justify-between items-center"
                >
                  <span className={goal.completed ? "line-through text-gray-400" : ""}>
                    {goal.text}
                  </span>
                  {goal.completed && <span>✅</span>}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-gray-400">No goals yet</p>
        )}
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Mood Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-md border hover:shadow-lg transition">
          <h3 className="mb-4 font-semibold">
            Mood Distribution
          </h3>

          {moodData.length === 0 ? (
            <p className="text-gray-400">No Data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={moodData}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {moodData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sleep Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-md border hover:shadow-lg transition">
          <h3 className="mb-4 font-semibold">
            Sleep Trends
          </h3>

          {sleepHistory.length === 0 ? (
            <p className="text-gray-400">No Data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sleepHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366f1"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({ title, value, icon, color }) {
  return (
    <div
      className={`bg-linear-to-r ${color} text-white rounded-2xl p-6 shadow-md hover:scale-105 transition`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <h3 className="text-2xl font-semibold mt-2">{value}</h3>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}