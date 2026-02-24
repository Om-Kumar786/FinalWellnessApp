import { useEffect } from "react";
import "./LandingPage.css";

export default function LandingPage({ onLoginClick }) {
  useEffect(() => {
    const createStar = (x, y) => {
      const star = document.createElement("div");
      star.className = "sparkle";
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;

      const size = Math.random() * 6 + 4;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      document.body.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 1000);
    };

    let lastMove = 0;

    const handleMove = (e) => {
      const now = Date.now();
      if (now - lastMove > 40) {
        createStar(e.clientX, e.clientY);
        lastMove = now;
      }
    };

    const handleClick = (e) => {
      for (let i = 0; i < 15; i += 1) {
        createStar(
          e.clientX + (Math.random() - 0.5) * 40,
          e.clientY + (Math.random() - 0.5) * 40,
        );
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="landing-container">
      <div className="animated-bg" />

      <div className="sea-layer" aria-hidden="true">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>

      <section className="hero">
        <div className="glass-card">
          <span className="badge">Student Wellness Platform</span>
          <h1 className="title">Welcome to Pulse</h1>
          <p className="subtitle">
            Track your mood, sleep, goals and mindfulness in one place.
          </p>

          <div className="button-group">
            <button className="primary-btn" onClick={onLoginClick}>
              Get Started
            </button>
            <button className="glass-btn" onClick={onLoginClick}>
              Login
            </button>
          </div>

          <div className="scroll-indicator">Scroll to Explore</div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Pulse?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Mood Tracking</h3>
            <p>Understand your emotional patterns over time.</p>
          </div>

          <div className="feature-card">
            <h3>Sleep Monitoring</h3>
            <p>Improve your rest with detailed insights.</p>
          </div>

          <div className="feature-card">
            <h3>Mindfulness</h3>
            <p>Stay calm and focused with guided sessions.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
