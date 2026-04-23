        import "../styles/Logs.css"; 
        import React, { useState } from "react";
        import { useNavigate } from "react-router-dom";
        
        function LogWellness(){
          const navigate = useNavigate();
          const [wellnessForm, setWellnessForm] = useState({
            hoursSlept: "",
            waterLog: "",
            heartRate: "", 
            stepLog: "",    
          }); 
        
          const handleWellnessChange = (e) => {
            const { name, value, type } = e.target; 
            setWellnessForm((prev) => ({
              ...prev, 
              [name]: type === "number" ? value : value, 
            }));  
          }; 
        
          const handleWellnessSubmit = (e) => {
            const savedWellness = JSON.parse(localStorage.getItem("loggedWellness")) || []; 
        
            const newWellness = {
              ...wellnessForm, 
              date: new Date().toLocaleDateString(),
            }; 
        
            localStorage.setItem("loggedWellness", JSON.stringify([...savedWellness, newWellness])); 
        
            setWellnessForm({
              hoursSlept: "",
              waterLog: "",
              heartRate: "", 
              stepLog: "",  
            });
            navigate("/dashboard"); 
           };    
            
            
    return ( 
        <div className="form-page">
            <div className="form-card">
                <div className="form-header"> 
                  <div className="form-title">Log Your Stats</div>
                  <div className="form-subtitle">
                    Log hours slept, water intake, and average heart rate here.
                  </div>
                </div>

                <form className="form-body" onSubmit={handleWellnessSubmit}>
                  <div className="form-group">
                    <label>Number of Hours Slept</label>
                    <input
                      className="log-input"
                      type="number"
                      name="hoursSlept"
                      value={wellnessForm.hoursSlept}
                      onChange={handleWellnessChange}
                      placeholder="Enter Hours Slept"
                    />
                  </div>

                  <div className="form-group">
                    <label>Ounces of Water Consumed</label>
                    <input
                      className="log-input"
                      type="number"
                      name="waterLog"
                      value={wellnessForm.waterLog}
                      onChange={handleWellnessChange}
                      placeholder="Enter Ounces of Water Consumed"
                    />
                  </div>

                  <div className="form-group">
                    <label>Daily Steps</label>
                    <input
                      className="log-input"
                      type="number"
                      name="stepLog"
                      value={wellnessForm.stepLog}
                      onChange={handleWellnessChange}
                      placeholder="Enter Amount of Steps Today"
                    />
                  </div>

                  <div className="form-group">
                    <label>Average Heart Rate</label>
                    <input
                      className="log-input"
                      type="number"
                      name="heartRate"
                      value={wellnessForm.heartRate}
                      onChange={handleWellnessChange}
                      placeholder="Enter Average Heart Rate Today"
                    />
                  </div>

                <button type="submit" className="form-button">Log Wellness</button>
            </form> 
        </div> 
    </div> 
        )
    }; 

export default LogWellness; 