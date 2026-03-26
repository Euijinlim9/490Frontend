import React, { useState } from "react";
import Survey from "../components/Survey"; 

function Home() {
  const [showSurvey, setShowSurvey] = useState(true); 
  return (
    <div>
      <Survey
        show={showSurvey}
        onClose={() => setShowSurvey(false)}
        />
    <h1 className="page-title">Home</h1>
  </div>
  );
}

export default Home;