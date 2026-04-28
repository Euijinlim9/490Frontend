import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Header from "./components/Header";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Workouts from "./pages/Workouts";
import CustomWorkout from "./pages/CustomWorkout";
import PremadeWorkouts from "./pages/PremadeWorkouts";
import Logs from "./pages/Logs";
import Calendar from "./pages/Calendar";
import Payments from "./pages/Payments";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import SurveyPage from "./pages/SurveyPage";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import CoachDetails from "./pages/CoachDetail";
import RecentMeals from "./pages/RecentMeals";
import RecentWorkouts from "./pages/RecentWorkouts";
import ActiveWorkout from "./pages/ActiveWorkout";
import PaymentHistory from "./pages/PaymentHistory";
import ClientSurvey from "./components/ClientSurvey";
import AdminHeader from "./components/AdminHeader";
import CoachApplications from "./pages/adminpages/CoachApplications";
import ViewUsers from "./pages/adminpages/ViewUsers";
import AdminExercise from "./pages/adminpages/AdminExercise";
import UserReport from "./pages/adminpages/UserReports";
import LogMeal from "./pages/LogMeal"; 
import LogWorkout from "./pages/LogWorkout"; 
import LogWellness from "./pages/LogWellness"; 
import PremadeMeals from "./pages/PremadeMeals"; 
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsService from "./pages/TermsService";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import WeeklyCheckIn from "./pages/WeeklyCheckIn";
import DailyCheckIns from "./pages/DailyCheckIns";
import Notifications from "./pages/Notifications"; 

function App() {
  const location = useLocation();

  const hideMainHeader = 
    location.pathname === "/" || location.pathname === "/home" || location.pathname === "/signup" || location.pathname === "/login" || location.pathname === "/privacy" || location.pathname === "/terms" 
    || location.pathname === "/features" || location.pathname === "/how" || location.pathname === "/pricing" || location.pathname === "/about" || location.pathname === "/careers" || location.pathname === "/contact";  

  const { activeRole } = useContext(AuthContext);

  return (
    <div className="body">
      {!hideMainHeader && (
      <>
      <Header />
      {activeRole === "admin" && <AdminHeader />}
      </>
    )}

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/auth/callback" element={<GoogleAuthCallback />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/coach/:id" element={<CoachDetails />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/custom" element={<CustomWorkout />} />
          <Route path="/workouts/premade" element={<PremadeWorkouts />} />
          <Route path="/workouts/active" element={<ActiveWorkout />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recent-meals" element={<RecentMeals />} />
          <Route path="/recent-workouts" element={<RecentWorkouts />} />
          <Route path="/test-survey" element={<ClientSurvey show={true} onClose={() => {}} />} />
            {activeRole === "admin" && (
              <>
              <Route path="/admin/coachapp" element={<CoachApplications />} />
              <Route path="/admin/viewusers" element={<ViewUsers />} />
              <Route path="/admin/exercise" element={<AdminExercise />} />
              <Route path="/admin/userreport" element={<UserReport />} />
              </>
            )}

          <Route path="/log-meal" element={<LogMeal />} />
          <Route path="/log-workout" element={<LogWorkout />} /> 
          <Route path="/log-wellness" element={<LogWellness />} /> 
          <Route path="/premade-meals" element={<PremadeMeals />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsService />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/how" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/weekly-checkin" element={<WeeklyCheckIn />} />
          <Route path="/daily-checkin" element={<DailyCheckIns />} />
          <Route path="/notifications" element={<Notifications />} />

        </Routes>
      </div>
    </div>
  );
}

export default App;
