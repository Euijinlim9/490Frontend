import React, { useState } from "react"; 
import "../styles/CheckIn.css"; 
import { useNavigate } from "react-router-dom"; 

function DailyCheckIns(){
    const [formData, setFormData] = useState({
        mood: "", 
        energy: 5, 
        stress: 5, 
        sleep: "",
        body: "", 
        motivation: "", 
    }); 

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target; 
        
        setFormData((prev) => ({
            ...prev, 
            [name]: value, 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); 

        const savedDailyCheckins = JSON.parse(localStorage.getItem("DailyCheckIns")) || []; 

        const newDailyCheckin = {
            ...formData, 
            date: new Date().toLocaleDateString(), 
        }; 

        localStorage.setItem(
            "DailyCheckIns", 
            JSON.stringify([...savedDailyCheckins, newDailyCheckin])
        );
        
        localStorage.setItem(
            "lastDailyCheckin", 
            new Date().toLocaleDateString()
        ); 
        alert("Weekly check-in saved!");  
        navigate("/dashboard");
    }; 

    return (
        <div className="weekly-page"> 
          <div className="weekly-card">
            <h1>Daily Check-in</h1>
            <p>Track your progress for the day.</p>

            <form onSubmit={handleSubmit} className="weekly-form"> 
                <div className="weekly-group"> 
                    <label>Mood Today</label>
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
                      <option value="exhausted">Exhausted</option>
                    </select> 
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
                    <label>Sleep Quality</label>
                    <select
                      name="sleep"
                      value={formData.sleep}
                      onChange={handleChange}
                    >
                      <option value="">Select Quality</option>
                      <option value="great">Excellent</option>
                      <option value="good">Good</option>
                      <option value="okay">Okay</option>
                      <option value="poor">Poor</option>
                    </select> 
                </div> 

                <div className="weekly-group">
                    <label>Body Feels</label>
                    <select
                      name="body"
                      value={formData.body}
                      onChange={handleChange}
                    >
                      <option value="">Select Feeling</option>
                      <option value="fresh">Fresh</option>
                      <option value="sore">Sore</option>
                      <option value="tight">Tight</option>
                      <option value="Recovered">Recovered</option>
                    </select> 
                </div>

                <div className="weekly-group"> 
                    <label>Motivation Level (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleChange} 
                    />
                    <span>{formData.motivation}</span>
                </div> 

                <button type="submit" className="weekly-submit">
                    Submit Daily Check-In
                </button>
            </form> 
        </div> 
    </div> 
    );
}

export default DailyCheckIns; 