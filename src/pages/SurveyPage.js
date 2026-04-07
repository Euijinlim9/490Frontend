import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CoachSurvey from "../components/CoachSurvey";
import ClientSurvey from "../components/ClientSurvey";
import { AuthContext } from "../context/AuthContext";

const SurveyPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return user?.role === "coach" ? (
    <CoachSurvey show={true} onClose={() => navigate("/dashboard")} />
  ) : (
    <ClientSurvey show={true} onClose={() => navigate("/dashboard")} />
  );
};

export default SurveyPage;
