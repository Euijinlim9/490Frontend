import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Survey.css";

function ClientSurvey({ show, onClose }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    goal: "",
    weeklyChange: "",
    currentActivity: "",
    goalActivity: "",
    coachHelp: "",
    typeWorkout: "",
    nutritionistHelp: "",
    dietPreference: "",
    gender: "",
    currentWeight: "",
    goalWeight: "",
    dob: "",
    heightFT: "",
    heightIn: "",
    workoutDay: "",
    activityMins: "",
  });

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

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const is18 = (dob) => {
    return calculateAge(dob) >= 18;
  };

  const convertHeightToCm = (feet, inches) => {
    const totalInches = Number(feet) * 12 + Number(inches);
    return totalInches * 2.54;
  };

  const getActivityFactor = (activityLevel) => {
    switch (activityLevel) {
      case "sedentary":
        return 1.2;
      case "light":
        return 1.375;
      case "moderate":
        return 1.55;
      case "very":
        return 1.725;
      case "extra":
        return 1.9;
      default:
        return 1.2;
    }
  };

  const calculateBMR = (gender, weightKg, heightCm, age) => {
    if (gender === "male") {
      return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else if (gender === "female") {
      return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
    return 0;
  };

  const calculateCalorieTarget = (tdee, goal, weeklyChange) => {
    const changeMap = {
      0.5: 250,
      1: 500,
      1.5: 750,
    };

    const adjustment = changeMap[weeklyChange] || 0;

    if (goal === "lose") {
      return tdee - adjustment;
    }

    if (goal === "gain") {
      return tdee + adjustment;
    }
    return tdee;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.dob) {
      alert("Please enter date of birth.");
      return;
    }

    if (!is18(form.dob)) {
      alert("You must be at least 18 years old.");
      return;
    }

    if (!form.heightFT || !form.heightIn) {
      alert("Please select your height.");
      return;
    }

    if (!form.gender) {
      alert("Please select your gender.");
      return;
    }

    if (!form.currentWeight) {
      alert("Please enter your current weight.");
      return;
    }

    if (!form.currentActivity) {
      alert("Please select your current activity level.");
      return;
    }

    const age = calculateAge(form.dob);
    const heightCm = convertHeightToCm(form.heightFT, form.heightIn);

    const weightKg = Number(form.currentWeight) * 0.453592;

    const activityFactor = getActivityFactor(form.currentActivity);
    const bmr = calculateBMR(form.gender, weightKg, heightCm, age);
    const tdee = bmr * activityFactor;
    const calorieTarget = calculateCalorieTarget(
      tdee,
      form.goal,
      form.weeklyChange
    );

    const surveyData = {
      ...form,
      age,
      heightCm,
      weightKg,
      activityFactor,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieTarget: Math.round(calorieTarget),
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem("clientSurveyData", JSON.stringify(surveyData));

    const newWeightEntry = {
      label: new Date().toISOString(),
      value: Number(form.currentWeight),
    };

    const existingWeightData =
      JSON.parse(localStorage.getItem("weightData")) || [];

    localStorage.setItem(
      "weightData",
      JSON.stringify([...existingWeightData, newWeightEntry])
    );

    localStorage.setItem(
      "dashboardData",
      JSON.stringify({
        goalActivity: form.activityMins,
        calorieTarget: Math.round(calorieTarget),
      })
    );

    console.log("Survey submitted!", surveyData);
    onClose();
    navigate("/dashboard");
  };

  if (!show) return null;

  return (
    <div className="survey-overlay">
      <div className="survey-box">
        <h2>Initial Intake Form</h2>
        <form onSubmit={handleSubmit} className="survey-form">
          <div className="survey-section-title">Goals</div>

          <select name="goal" value={form.goal} onChange={handleChange}>
            <option value="">Select Your Goal</option>
            <option value="lose">Lose Weight</option>
            <option value="gain">Gain Weight</option>
            <option value="maintain">Maintain</option>
          </select>

          <select
            name="weeklyChange"
            value={form.weeklyChange}
            onChange={handleChange}
          >
            <option value="">Select Weight/Week</option>
            <option value="0.5">0.5 lb/week</option>
            <option value="1">1 lb/week</option>
            <option value="1.5">1.5 lb/week</option>
          </select>

          <select
            name="currentActivity"
            value={form.currentActivity}
            onChange={handleChange}
          >
            <option value="">Select Current Activity Level</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly Active</option>
            <option value="moderate">Moderately Active</option>
            <option value="very">Very Active</option>
            <option value="extra">Extra Active</option>
          </select>

          <select
            name="workoutDay"
            value={form.workoutDay}
            onChange={handleChange}
          >
            <option value="">Select Goal Activity Level</option>
            <option value="1">1 days</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="6">6 days</option>
            <option value="7">7 days</option>
          </select>

          <div className="survey-section-title">Preferences</div>

          <select
            name="coachHelp"
            value={form.coachHelp}
            onChange={handleChange}
          >
            <option value="">Select Coaching Option</option>
            <option value="workout-plans">Workout Plans</option>
            <option value="no-help">No Coach</option>
          </select>

          <select
            name="typeWorkout"
            value={form.typeWorkout}
            onChange={handleChange}
          >
            <option value="">Select Type of Workout</option>
            <option value="strength-training">Strength Training</option>
            <option value="cardio">Cardio</option>
            <option value="low-impact">Low Impact</option>
            <option value="mixed">Mixed</option>
          </select>

          <select
            name="nutritionistHelp"
            value={form.nutritionistHelp}
            onChange={handleChange}
          >
            <option value="">Select Nutritionist Option</option>
            <option value="meal-plans">Meal Plans</option>
            <option value="calorie-tracking">Calorie Tracking</option>
            <option value="diet-guidance">Diet Guidance</option>
            <option value="no-help">No Nutritionist</option>
          </select>

          <select
            name="dietPreference"
            value={form.dietPreference}
            onChange={handleChange}
          >
            <option value="">Select Diet Preferences</option>
            <option value="none">None</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="gluten-free">Gluten Free</option>
            <option value="vegan">Vegan</option>
          </select>

          <div className="survey-section-title">Personal Stats</div>

          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>

          <input
            type="number"
            name="currentWeight"
            value={form.currentWeight}
            onChange={handleChange}
            placeholder="Enter Current Weight (lbs)"
          />

          <input
            type="number"
            name="goalWeight"
            value={form.goalWeight}
            onChange={handleChange}
            placeholder="Enter Goal Weight (lbs)"
          />

          <input
            type="number"
            name="activityMins"
            value={form.activityMins}
            onChange={handleChange}
            placeholder="Enter Goal Activity Minutes Per Day"
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
              <select
                name="heightFT"
                value={form.heightFT}
                onChange={handleChange}
              >
                <option value="">ft</option>
                <option value="4">4ft</option>
                <option value="5">5ft</option>
                <option value="6">6ft</option>
              </select>

              <select
                name="heightIn"
                value={form.heightIn}
                onChange={handleChange}
              >
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
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClientSurvey;
