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
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">

     {/* Nature Background */}
<div
  className="absolute inset-0 bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=100')",
  }}
/>

{/* Soft Overlay for readability */}
<div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

      {/* Glass Card */}
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[rgba(255,255,255,0.8)] p-10 text-[var(--text)] shadow-soft backdrop-blur-xl dark:bg-[rgba(15,23,42,0.75)]">

        <h1 className="text-3xl font-bold text-center mb-2">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        <p className="text-center text-muted mb-6 text-sm">
          {isSignup
            ? "Create your Pulse account"
            : "Login to continue your wellness journey"}
        </p>

        <input
          type="text"
          placeholder="Username"
          className="input w-full mb-4 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition placeholder:text-[var(--muted-2)]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input w-full mb-6 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition placeholder:text-[var(--muted-2)]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignup ? (
          <button
            onClick={handleSignup}
            className="w-full btn-success py-2 rounded-lg hover:brightness-110 transition duration-300 mb-4"
          >
            Create Account
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full btn-primary py-2 rounded-lg hover:brightness-110 transition duration-300 mb-4"
          >
            Login
          </button>
        )}

        <p className="text-center text-sm text-muted">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="ml-2 underline text-[var(--accent)] hover:brightness-110 transition"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>

        <p className="text-xs text-center mt-6 text-muted">
          Student Wellness Portal 🌿
        </p>

      </div>
    </div>
  );
}
