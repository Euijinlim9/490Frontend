import React, { useState } from "react"; 
import "../styles/CheckIn.css"; 

function WeeklyCheckIn(){
    const [formData, setFormData] = useState({
        weight: "", 
        energy: 5, 
        stress: 5, 
        mood: "", 
        nextGoal: "",
    }); 

    const handleChange = (e) => {
        const { name, value } = e.target; 
        
        setFormData((prev) => ({
            ...prev, 
            [name]: value, 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); 

        const savedCheckins = JSON.parse(localStorage.getItem("weeklyCheckins")) || []; 

        const newCheckin = {
            ...formData, 
            date: new Date().toLocaleDateString(), 
        }; 

        localStorage.setItem(
            "weeklyCheckins", 
            JSON.stringify([...savedCheckins, newCheckin])
        );

        localStorage.setItem("lastWeeklyCheckin", `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date.getDate()}`); 

        alert("Weekly check-in saved!"); 

        setFormData({
            weight: "", 
            energy: 5,
            stress: 5,
            mood: "",
            nextGoal: "",
        });
    };

    return (
        <div className="weekly-page"> 
          <div className="weekly-card">
            <h1>Weekly Check-in</h1>
            <p>Reflect on your week and track your progress.</p>

            <form onSubmit={handleSubmit} className="weekly-form"> 
                <div className="weekly-group"> 
                    <label>Weekly Weight</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="Enter Weight"
                    />
                </div> 

                <div className="weekly-group"> 
                    <label>Energy Level (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      name="energy"
                      value={formData.energy}
                      onChange={handleChange} 
                    />
                    <span>{formData.energy}</span>
                </div> 

                <div className="weekly-group">
                    <label>Stress Level (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      name="stress"
                      value={formData.stress}
                      onChange={handleChange} 
                    />
                    <span>{formData.stress}</span>
                </div>

                <div className="weekly-group">
                    <label>Mood</label>
                    <select
                      name="mood"
                      value={formData.mood}
                      onChange={handleChange}
                    >
                      <option value="">Select Mood</option>
                      <option value="great">Great</option>
                      <option value="good">Good</option>
                      <option value="okay">Okay</option>
                      <option value="low">Low</option>
                    </select> 
                </div> 

                <div className="weekly-group">
                    <label>Goal for Next Week</label>
                    <textarea 
                      name="nextGoal"
                      value={formData.nextGoal}
                      onChange={handleChange}
                      placeholder="What do you want to improve next week?"
                    />
                </div>

                <button type="submit" className="weekly-submit">
                    Submit Weekly Check-In
                </button>
            </form> 
        </div> 
    </div> 
    );
}

export default WeeklyCheckIn; 