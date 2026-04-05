import Survey from "../components/Survey";
import { useNavigate } from "react-router-dom";

import React from "react";

const SurveyPage = () => {
  const navigate = useNavigate();

  return (
    <Survey
      show={true}
      onClose={() => {
        navigate("/dashboard");
      }}
    />
  );
};

export default SurveyPage;
