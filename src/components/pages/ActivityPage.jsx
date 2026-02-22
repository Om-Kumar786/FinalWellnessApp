export default function ActivityPage({ data, setData }) {
  const handleChange = (e) => {
    const value = Number(e.target.value);

    setData({
      ...data,
      steps: value,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <h1 className="text-3xl font-semibold">
        Activity Tracking
      </h1>

      {/* Current Steps Display */}
      <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
        <p className="text-gray-500 text-sm">
          Current Steps
        </p>

        <h2 className="text-5xl font-bold mt-4">
          {data.steps}
        </h2>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <label className="block mb-3 text-gray-600">
          Update Steps
        </label>

        <input
          type="number"
          value={data.steps}
          onChange={handleChange}
          className="border rounded-lg p-3 w-full"
          placeholder="Enter today's steps"
        />
      </div>

    </div>
  );
}