        import "../styles/Logs.css"; 
        import React, { useState } from "react";
        import { useNavigate } from "react-router-dom";
        
        function LogWellness(){
          const navigate = useNavigate();
          const [wellnessForm, setWellnessForm] = useState({
            hoursSlept: "",
            waterLog: "",
            notes: "", 
            stepLog: "", 
          }); 
        
          const handleWellnessChange = (e) => {
            const { name, value, type } = e.target; 
            setWellnessForm((prev) => ({
              ...prev, 
              [name]: type === "number" ? value : value, 
            }));  
          }; 
        
          const handleWellnessSubmit = async (e) => {
            e.preventDefault();

            const token = localStorage.getItem("token");
            
            const payload = {
              sleep_hours: Number(wellnessForm.hoursSlept),
              water_intake_oz: Number(wellnessForm.waterLog),
              steps: Number(wellnessForm.stepLog),
              notes: wellnessForm.notes,
              date: new Date().toISOString().split("T")[0],
            };

            try {
              const res = await fetch("http://localhost:4000/api/logs/wellness-check", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });

              if(!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to log wellness");
              }

              setWellnessForm({
                hoursSlept: "",
                waterLog: "",
                stepLog: "",
                notes: "",
              });

              alert("Wellness Logged!");
              navigate("/logs");
            } catch (err) {
              console.error(err);
              alert(err.message);
            }
           };    
            
            
    return ( 
        <div className="form-page">
            <div className="form-card">
                <div className="form-header"> 
                  <div className="form-title">Log Your Stats</div>
                  <div className="form-subtitle">
                    Log hours slept, water intake, and journal here.
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
                    <label>Notes</label>
                    <input
                      className="log-input"
                      type="text"
                      name="notes"
                      value={wellnessForm.notes}
                      onChange={handleWellnessChange}
                      placeholder="Enter anything you would like to journal today."
                    />
                  </div>

                <button type="submit" className="form-button">Log Wellness</button>
            </form> 
        </div> 
    </div> 
        )
    }; 

export default LogWellness; 