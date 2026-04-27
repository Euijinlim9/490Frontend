import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { Link } from "react-router-dom";

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
              <Link to="/features">Features</Link>
              <Link to="/how">How It Works</Link>
              <Link to="/pricing">Pricing</Link>
            </div>

            <div className="landing-footer__column">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/contact">Contact</Link>
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
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
