import React, { useState } from "react";
import HomeHeader from "../components/HomeHeader";
import HomeFooter from "../components/HomeFooter";

// Landing Page
function Home() {
  const [showSurvey, setShowSurvey] = useState(true);

  return (
    <div className="home-page">
      <HomeHeader />
      <div className="home-content">
        <h1>Home</h1>
      </div>
      <HomeFooter />
    </div>
  );
}

export default Home;
