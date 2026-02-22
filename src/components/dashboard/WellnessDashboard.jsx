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
  const moodHistory = data?.moodHistory || [];
  const sleepHistory = data?.sleepHistory || [];

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

  return (
    <div className="relative min-h-screen">

      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee')",
        }}
      />
      <div className="absolute inset-0 bg-white/70" />

      <div className="relative z-10 max-w-7xl mx-auto p-8 space-y-10">

        <h1 className="text-3xl font-semibold">Wellness Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card title="Mood" value={data.mood} />
          <Card title="Sleep" value={data.sleepHours} />
          <Card title="Steps" value={data.steps} />
          <Card title="Stress" value={data.stressLevel} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="bg-white rounded-xl p-6 shadow border">
            <h3 className="mb-4 font-semibold">Mood Distribution</h3>
            {moodData.length === 0 ? (
              <p>No Data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={moodData} dataKey="value" innerRadius={50} outerRadius={90}>
                    {moodData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow border">
            <h3 className="mb-4 font-semibold">Sleep Trends</h3>
            {sleepHistory.length === 0 ? (
              <p>No Data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sleepHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="hours" stroke="#6366f1" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow border">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-2xl font-semibold mt-2">{value}</h3>
    </div>
  );
}