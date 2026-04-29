import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function LandingHeader() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`landing-header ${scrolled ? "landing-header--scrolled" : ""}`}
    >
      <div className="landing-header__inner">
        <div className="landing-header__logo" onClick={() => navigate("/")}>
          <div className="landing-header__logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="10" width="24" height="8" rx="4" fill="#4a9eff" />
              <rect x="6" y="4" width="4" height="20" rx="2" fill="#4a9eff" />
              <rect x="18" y="4" width="4" height="20" rx="2" fill="#4a9eff" />
            </svg>
          </div>
          <span className="landing-header__logo-text">FitnessFR</span>
        </div>

        <nav className="landing-header__nav">
          <button
            className="landing-header__link"
            onClick={() => navigate("/features")}
          >
            Features
          </button>
          <button
            className="landing-header__link"
            onClick={() => navigate("/how")}
          >
            How It Works
          </button>
        </nav>

        <div className="landing-header__actions">
          <button
            className="landing-header__signin"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
          <button
            className="landing-header__signup"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;
