import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    // Simulated authentication
    const user = { name: username };
    localStorage.setItem("user", JSON.stringify(user));
    onLogin(user);
  };

  const handleGoogleLogin = () => {
    // Simulated Google login
    const user = { name: "Google User" };
    localStorage.setItem("user", JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Welcome to WellnessHub
        </h1>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          className="w-full border p-3 rounded-lg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
        >
          Sign In
        </button>

        <div className="text-center text-gray-400">OR</div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border py-3 rounded-lg hover:bg-gray-50"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}