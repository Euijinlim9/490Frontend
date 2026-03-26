import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Workouts from "./pages/Workouts";
import Logs from "./pages/Logs";
import Calendar from "./pages/Calendar";
import Payments from "./pages/Payments";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

import PaymentHistory from "./pages/PaymentHistory";

function App() {
  return (
    <div className="body">
      <Header />

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;