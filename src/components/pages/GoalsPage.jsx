export default function GoalsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Goals</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-2">Sleep 8+ Hours</h3>
          <p className="text-gray-500">4/7 days this week</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-2">Exercise 30 Minutes</h3>
          <p className="text-gray-500">5/7 days this week</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-2">Meditate Daily</h3>
          <p className="text-gray-500">3/7 days this week</p>
        </div>
      </div>
    </div>
  );
}