import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const existingUsers =
      JSON.parse(localStorage.getItem("users")) || [];

    const userExists = existingUsers.find(
      (user) => user.username === username
    );

    if (userExists) {
      alert("Username already exists");
      return;
    }

    localStorage.setItem(
      "users",
      JSON.stringify([
        ...existingUsers,
        { username, password },
      ])
    );

    alert("Account created! Please login.");
    setIsSignup(false);
    setUsername("");
    setPassword("");
  };

  const handleLogin = () => {
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const validUser = users.find(
      (user) =>
        user.username === username &&
        user.password === password
    );

    if (!validUser) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", username);
    onLogin();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">

     {/* Nature Background */}
<div
  className="absolute inset-0 bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=100')",
  }}
/>

{/* Soft Overlay for readability */}
<div className="absolute inset-0 bg-black/25" />

      {/* Glass Card */}
      <div className="relative z-10 bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-96 border border-white/30 text-white">

        <h1 className="text-3xl font-bold text-center mb-2">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        <p className="text-center text-white/80 mb-6 text-sm">
          {isSignup
            ? "Create your Pulse account"
            : "Login to continue your wellness journey"}
        </p>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignup ? (
          <button
            onClick={handleSignup}
            className="w-full bg-linear-to-r from-green-500 to-emerald-600 py-2 rounded-lg hover:scale-105 transition duration-300 mb-4"
          >
            Create Account
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full bg-linear-to-r from-indigo-500 to-purple-600 py-2 rounded-lg hover:scale-105 transition duration-300 mb-4"
          >
            Login
          </button>
        )}

        <p className="text-center text-sm text-white/90">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="ml-2 underline hover:text-indigo-200 transition"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>

        <p className="text-xs text-center mt-6 text-white/80">
          Student Wellness Portal 🌿
        </p>

      </div>
    </div>
  );
}