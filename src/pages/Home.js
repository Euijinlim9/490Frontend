import HomeHeader from "../components/HomeHeader";
import HomeFooter from "../components/HomeFooter";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <HomeHeader />

      <div className="hero-section">
        <div className="hero-content">
          <h1>FitnessFR</h1>

          <h2>Your Fitness Journey, Fully Connected.</h2>

          <p>
            Track workouts, nutrition, wellness, and coaching — all in one
            platform designed to help you stay consistent.
          </p>

          <div className="hero-buttons">
            <button 
              className="hero-primary"
              onClick={() => navigate("/login")}
              >
                Get Started
                </button>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}

export default Home;