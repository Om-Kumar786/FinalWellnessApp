import { useEffect, useState } from "react";

const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123",
  role: "admin",
};

const parseUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

export default function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminPortal, setIsAdminPortal] = useState(false);

  useEffect(() => {
    const users = parseUsers();
    const hasAdmin = users.some((user) => user.role === "admin");
    if (!hasAdmin) {
      localStorage.setItem("users", JSON.stringify([DEFAULT_ADMIN, ...users]));
    }
  }, []);

  const handleSignup = () => {
    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const existingUsers = parseUsers();
    const userExists = existingUsers.find((user) => user.username === username);
    if (userExists) {
      alert("Username already exists");
      return;
    }

    localStorage.setItem(
      "users",
      JSON.stringify([...existingUsers, { username, password, role: "user" }]),
    );

    alert("Account created. Please login.");
    setIsSignup(false);
    setUsername("");
    setPassword("");
  };

  const handleLogin = () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    const users = parseUsers();
    const validUser = users.find(
      (user) => user.username === username && user.password === password,
    );

    if (!validUser) {
      alert("Invalid credentials");
      return;
    }

    if (isAdminPortal && validUser.role !== "admin") {
      alert("Admin access only. Please use admin credentials.");
      return;
    }

    const sessionUser = { username: validUser.username, role: validUser.role || "user" };
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", sessionUser.username);
    localStorage.setItem("currentUser", JSON.stringify(sessionUser));
    onLogin(sessionUser);
  };

  const canSignup = !isAdminPortal;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=90')",
        }}
      />

      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />

      <div className="relative z-10 mx-4 w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[rgba(255,255,255,0.8)] p-10 text-[var(--text)] shadow-soft backdrop-blur-xl dark:bg-[rgba(15,23,42,0.75)]">
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] p-1">
          <button
            type="button"
            onClick={() => {
              setIsAdminPortal(false);
              setIsSignup(false);
            }}
            className={`rounded-lg px-3 py-2 text-sm ${!isAdminPortal ? "btn-primary" : "btn-ghost"}`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminPortal(true);
              setIsSignup(false);
            }}
            className={`rounded-lg px-3 py-2 text-sm ${isAdminPortal ? "btn-primary" : "btn-ghost"}`}
          >
            Admin Portal
          </button>
        </div>

        <h1 className="mb-2 text-center text-3xl font-bold">
          {isSignup ? "Create Account" : isAdminPortal ? "Admin Portal" : "Welcome Back"}
        </h1>

        <p className="mb-6 text-center text-sm text-muted">
          {isSignup
            ? "Create your Pulse account"
            : isAdminPortal
              ? "Login with admin credentials"
              : "Login to continue your wellness journey"}
        </p>

        <input
          type="text"
          placeholder="Username"
          className="input mb-4 w-full rounded-lg px-4 py-2 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input mb-6 w-full rounded-lg px-4 py-2 transition placeholder:text-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignup ? (
          <button
            onClick={handleSignup}
            className="btn-success mb-4 w-full rounded-lg py-2 transition duration-300 hover:brightness-110"
          >
            Create Account
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="btn-primary mb-4 w-full rounded-lg py-2 transition duration-300 hover:brightness-110"
          >
            {isAdminPortal ? "Login to Admin Portal" : "Login"}
          </button>
        )}

        {canSignup && (
          <p className="text-center text-sm text-muted">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="ml-2 text-[var(--accent)] underline transition hover:brightness-110"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        )}

        {isAdminPortal && (
          <p className="mt-4 text-center text-xs text-muted">
            Default admin: <span className="font-semibold">admin / admin123</span>
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted">Student Wellness Portal</p>
      </div>
    </div>
  );
}
