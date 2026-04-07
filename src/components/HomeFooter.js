import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__top">
          <div className="landing-footer__brand">
            <div className="landing-footer__logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect
                  x="2"
                  y="10"
                  width="24"
                  height="8"
                  rx="4"
                  fill="#4a9eff"
                />
                <rect x="6" y="4" width="4" height="20" rx="2" fill="#4a9eff" />
                <rect
                  x="18"
                  y="4"
                  width="4"
                  height="20"
                  rx="2"
                  fill="#4a9eff"
                />
              </svg>
              <span>FitnessFR</span>
            </div>
            <p className="landing-footer__tagline">
              Your all-in-one platform for personalized fitness coaching,
              nutrition planning, and progress tracking.
            </p>
          </div>

          <div className="landing-footer__columns">
            <div className="landing-footer__column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
            </div>

            <div className="landing-footer__column">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="landing-footer__column">
              <h4>Get Started</h4>
              <a
                href="#signin"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Sign In
              </a>
              <a
                href="#signup"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/signup");
                }}
              >
                Create Account
              </a>
            </div>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p>&copy; 2026 Fitness FR. All rights reserved.</p>
          <div className="landing-footer__legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
