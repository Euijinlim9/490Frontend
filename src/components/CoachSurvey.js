import React, { useState } from "react";
import "../styles/Survey.css";

function Survey({ show, onClose }){
    const [ form, setForm ] = useState({
        specialities: "", 
        workoutType: "", 
        clientLevel: "", 
        coachingStyle: "",
        preferredGoals: "", 
        availabilityDay: "", 
        limitations: "",
    }); 

    const handleChange = (e) => {
        setForm({
            ...form, 
            [e.target.name]: e.target.value, 
        });
    }; 

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Survey submitted!", form); 
        //backend 
        onClose(); 
    }; 

    if (!show) return null;

    return(
        <div className="survey-overlay">
            <div className="survey-box"> 
                <h2>Initial Survey</h2>
                <form onSubmit={handleSubmit} className="survey-form"> 

                    <select name="workoutType" value={form.typeWorkout} onChange={handleChange}>
                        <option value="">Select Type of Workout</option>
                        <option value="strength-training">Strength Training</option>
                        <option value="cardio">Cardio</option>
                        <option value="low-impact">Low Impact</option>
                        <option value="mixed">Mixed</option>
                    </select>

                    <select name="clientLevel" value={form.dietPreference} onChange={handleChange}>
                        <option value="">Select Preferred Client Level For Activity</option>
                        <option value="none">No preference</option>
                        <option value="beginner">Beginner</option>
                        <option value="moderate">Moderate</option>
                        <option value="advanced">Advanced</option>
                    </select>

                    <select name="coachingStyle" value={form.currentActivity} onChange={handleChange}>
                        <option value="">Select What Type of Cpaching Style Matches You Closest</option>
                        <option value="strict">Strict</option>
                        <option value="flexible">Flexible</option>
                        <option value="hands-on">Hands-on</option>
                        <option value="hands-off">Hands-off</option>
                    </select>

                    <select name="preferredGoals" value={form.coachHelp} onChange={handleChange}>
                        <option value="">Select What your Prefer Your Client's Goal To Be</option>
                        <option value="muscle-gain">Muscle Gain</option>
                        <option value="fat-loss">Fat Loss</option>
                        <option value="consistency">Consistency</option>
                    </select>

                    <select name="availabilityDay" value={form.nutritionistHelp} onChange={handleChange}>
                        <option value="">Select What Days You Are Available to Coach</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                    </select> 

                    <select name="limitations" value={form.workoutDay} onChange={handleChange}>
                        <option value="">Select Limitations of Your Coaching</option>
                        <option value="post-injury">No clients post-injury</option>
                        <option value="advanced-lifting">No clients in advanced powerlifting</option>
                        <option value="male-oriented">Only male clients</option>
                        <option value="female-oriented">Only female clients</option>
                        <option value="older-50">No clients over 50</option>
                        <option value="younger-50">No client over 50</option>
                        <option value="extreme-cardio">No clients into extreme cardio. Running, half, full marathons, etc</option>

                    </select> 

                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default Survey;
