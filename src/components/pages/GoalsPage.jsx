import { useState } from "react";

export default function GoalsPage({ data, setData }) {

  const predefinedGoals = [
    "Walk 10,000 steps daily",
    "Sleep 8 hours every night",
    "Drink 3L of water",
    "Meditate for 15 minutes",
    "Reduce screen time",
  ];

  const [customGoal, setCustomGoal] = useState("");

  const goals = data?.goals || [];

  const addGoal = (goalText) => {
    if (!goalText.trim()) return;

    setData((prev) => ({
      ...prev,
      goals: [
        ...(prev.goals || []),
        { id: Date.now(), text: goalText, completed: false }
      ]
    }));
  };

  const toggleGoal = (id) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) =>
        goal.id === id
          ? { ...goal, completed: !goal.completed }
          : goal
      ),
    }));
  };

  const deleteGoal = (id) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal.id !== id),
    }));
  };

  const completed = goals.filter(g => g.completed).length;
  const percent = goals.length > 0
    ? Math.round((completed / goals.length) * 100)
    : 0;

  return (
    <div className="p-8 space-y-8">

      <h1 className="text-3xl font-semibold">Goals</h1>

      {/* Progress */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <p className="font-medium">
          Progress: {completed} / {goals.length} completed ({percent}%)
        </p>

        <div className="w-full bg-gray-200 h-3 rounded-full mt-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Predefined Goals */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Choose a Goal</h2>
        <div className="flex flex-wrap gap-3">
          {predefinedGoals.map((goal, index) => (
            <button
              key={index}
              onClick={() => addGoal(goal)}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Goal */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Create Custom Goal</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="Enter custom goal"
            className="flex-1 p-3 border rounded-lg"
          />
          <button
            onClick={() => {
              addGoal(customGoal);
              setCustomGoal("");
            }}
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Goal List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Goals</h2>

        {goals.length === 0 ? (
          <p className="text-gray-400">No goals yet</p>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm mb-3"
            >
              <span className={goal.completed ? "line-through text-gray-400" : ""}>
                {goal.text}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  {goal.completed ? "Undo" : "Done"}
                </button>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}