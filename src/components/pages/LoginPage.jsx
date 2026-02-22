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
    <div className="relative h-screen flex items-center justify-center">

      {/* 🌲 Forest Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      {/* 🌑 Dark Overlay (VERY DIM) */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 🌿 Glass Login Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-96 border border-white/20 text-white">

        <h1 className="text-3xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignup ? (
          <button
            onClick={handleSignup}
            className="w-full bg-green-500/80 text-white py-2 rounded-lg hover:bg-green-600 transition mb-4"
          >
            Create Account
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-500/80 text-white py-2 rounded-lg hover:bg-indigo-600 transition mb-4"
          >
            Login
          </button>
        )}

        <p className="text-center text-sm">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="ml-2 underline"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>

        <p className="text-xs text-center mt-6 text-white/70">
          Student Wellness Portal 🌿
        </p>

      </div>
    </div>
  );
}