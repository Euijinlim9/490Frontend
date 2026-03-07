import './App.css';
import React from "react";
import userIcon from "./images/user.svg";
import inboxIcon from "./images/inbox.svg";

function App() {
  return (
    <div className="body">
      <div className="header">
        <div className="logo">logo</div>

        <div className="nav-pill">
          <button className="nav-btn">Dashboard</button>
          <button className="nav-btn">Coach</button>
          <button className="nav-btn">Workouts</button>
          <button className="nav-btn">Logs</button>
          <button className="nav-btn">Calendar</button>
          <button className="nav-btn">Payments</button>
        </div>

        <div className="right-btns">
          <div className="icon-btn">
            <div className="circle">
              <img src={inboxIcon} alt="Messages icon" className="circle-icon" />
            </div>
            <div className="nav-small">
              <button className="nav-btn-small">Messages</button>
            </div>
          </div>

          <div className="icon-btn">
            <div className="circle">
              <img src={userIcon} alt="Profile icon" className="circle-icon" />
            </div>
            <div className="nav-small">
              <button className="nav-btn-small">Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;