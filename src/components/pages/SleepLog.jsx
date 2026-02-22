export default function SleepLog({ data, setData }) {
  const handleSleepChange = (e) => {
    const hours = Number(e.target.value);

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "short",
    });

    setData((prev) => {
      const safeHistory = prev.sleepHistory || [];

      return {
        ...prev,
        sleepHours: hours,
        sleepHistory: [
          ...safeHistory.filter((item) => item.day !== today),
          { day: today, hours: hours },
        ],
      };
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Sleep Log</h1>

      <input
        type="number"
        value={data?.sleepHours || ""}
        onChange={handleSleepChange}
        className="border p-3 rounded-lg"
        placeholder="Enter sleep hours"
      />
    </div>
  );
}