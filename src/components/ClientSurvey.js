import React, { useState, useEffect } from "react";
import "../styles/Survey.css";

function ClientSurvey({ show, onClose }){
    const [ form, setForm ] = useState({
        goal: "", 
        typeWorkout: "", 
        dietPreference: "", 
        currentActivity: "",
        coachHelp: "", 
        nutritionistHelp: "", 
        workoutDay: "",
        currentWeight: "", 
        dob: "",
        heightFT: "",
        heightIn: "",
    }); 

    const[weightData, setWeightData] = useState([]); 

    useEffect(() => {
      const savedWeightData =
        JSON.parse(localStorage.getItem("weightData")) || [];
      setWeightData(savedWeightData);
}, []);

    const handleChange = (e) => {
        setForm({
            ...form, 
            [e.target.name]: e.target.value, 
        });
    }; 

    const getMaxDOB = () => {
        const today = new Date(); 
        today.setFullYear(today.getFullYear() - 18); 
        return today.toISOString().split("T")[0]; 
    }; 

    const is18 = (dob) => {
        const birthDate = new Date(dob); 
        const today = new Date(); 

        let age = today.getFullYear() - birthDate.getFullYear(); 
        const monthDiff = today.getMonth() - birthDate.getMonth(); 

        if (
          monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) { 
            age--; 
        }

        return age >= 18; 
    }; 

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.dob){
           alert("Please enter date of birth."); 
           return; 
        }

        if(!is18(form.dob)){
          alert("You must be at least 18 years old."); 
          return; 
        }

        if (!form.heightFT || !form.heightIn){
            alert("Please select your height."); 
            return; 
        }

        console.log("Survey submitted!", form); 

        if (form.currentWeight){
            const newEntry = {
                label: new Date().toISOString(), 
                value: Number(form.currentWeight), 
            }; 

            const existing = JSON.parse(localStorage.getItem("weightData")) || []; 

            localStorage.setItem(
                "weightData", 
                JSON.stringify([...existing, newEntry])
            ); 
        }
        onClose(); 
    }; 

    if (!show) return null;

    return(
        <div className="survey-overlay">
            <div className="survey-box"> 
                <h2>Initial Intake Form</h2>
                <form onSubmit={handleSubmit} className="survey-form"> 

                    <select name="goal" value={form.goal} onChange={handleChange}>
                        <option value="">Select Your Goal</option>
                        <option value="lose">Lose Weight</option>
                        <option value="gain">Gain Weight</option>
                        <option value="maintain">Maintain</option> 
                    </select>

                    <select name="typeWorkout" value={form.typeWorkout} onChange={handleChange}>
                        <option value="">Select Type of Workout</option>
                        <option value="strength-training">Strength Training</option>
                        <option value="cardio">Cardio</option>
                        <option value="low-impact">Low Impact</option>
                        <option value="mixed">Mixed</option>
                    </select>

                    <select name="dietPreference" value={form.dietPreference} onChange={handleChange}>
                        <option value="">Select Diet Preferences</option>
                        <option value="none">none</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="gluten-free">Gluten Free</option>
                        <option value="vegan">Vegan</option>
                    </select>

                    <select name="currentActivity" value={form.currentActivity} onChange={handleChange}>
                        <option value="">Select Activity Level</option>
                        <option value="beginner">Beginner</option>
                        <option value="moderate">Moderate</option>
                        <option value="active">Active</option>
                        <option value="none">No Activity</option>
                    </select>

                    <select name="coachHelp" value={form.coachHelp} onChange={handleChange}>
                        <option value="">Select Coaching Option</option>
                        <option value="workout-plans">Workout Plans</option>
                        <option value="no-help">No Coach</option>
                    </select>

                    <select name="nutritionistHelp" value={form.nutritionistHelp} onChange={handleChange}>
                        <option value="">Select Nutritionist Option</option>
                        <option value="meal-plans">Meal Plans</option>
                        <option value="calorie-tracking">Calorie Tracking</option>
                        <option value="diet-guidance">Diet Guidance</option>
                        <option value="no-help">No Nutritionist</option>
                    </select> 

                    <select name="workoutDay" value={form.workoutDay} onChange={handleChange}>
                        <option value="">Select Days</option>
                        <option value="1">1 days</option>
                        <option value="2">2 days</option>
                        <option value="3">3 days</option>
                        <option value="4">4 days</option>
                        <option value="5">5 days</option>
                        <option value="6">6 days</option>
                    </select> 

                    <input
                      type="number"
                      name="currentWeight"
                      value={form.currentWeight}
                      onChange={handleChange}
                      placeholder="Enter Current Weight (lbs)"
                    />

                <div className="dob-height-row">
                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      max={getMaxDOB()}
                      className="dob-input"
                    />

                    <div className="height-group"> 
                      <select name="heightFT" value={form.heightFT} onChange={handleChange}>
                        <option value="">ft</option>
                        <option value="4">4ft</option>
                        <option value="5">5ft</option>
                        <option value="6">6ft</option>
                      </select>

                      <select name="heightIn" value={form.heightIn} onChange={handleChange}>
                        <option value="">in</option>
                        <option value="0">0 in</option>
                        <option value="1">1 in</option>
                        <option value="2">2 in</option>
                        <option value="3">3 in</option>
                        <option value="4">4 in</option>
                        <option value="5">5 in</option>
                        <option value="6">6 in</option>
                        <option value="7">7 in</option>
                        <option value="8">8 in</option>
                        <option value="9">9 in</option>
                        <option value="10">10 in</option>
                        <option value="11">11 in</option>
                      </select> 
                    </div>
                    </div> 
                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default ClientSurvey;
