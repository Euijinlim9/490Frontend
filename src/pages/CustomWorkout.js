import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CustomWorkout.css";
import { WorkoutContext } from "../context/WorkoutContext";

/*const COMMON_EXERCISES = 
  {
    name: "Push Ups",
    muscle: "Chest",
    reps: 15,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    thumbnail: "https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg",
  },
  {
    name: "Pull Ups",
    muscle: "Back",
    reps: 10,
    sets: 3,
    breakTime: 90,
    youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    thumbnail: "https://img.youtube.com/vi/eGo4IYlbE5g/hqdefault.jpg",
  },
  {
    name: "Squats",
    muscle: "Legs",
    reps: 20,
    sets: 4,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=aclHkVaku9U",
    thumbnail: "https://img.youtube.com/vi/aclHkVaku9U/hqdefault.jpg",
  },
  {
    name: "Deadlift",
    muscle: "Back / Legs",
    reps: 8,
    sets: 4,
    breakTime: 120,
    youtubeUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q",
    thumbnail: "https://img.youtube.com/vi/op9kVnSso6Q/hqdefault.jpg",
  },
  {
    name: "Bench Press",
    muscle: "Chest",
    reps: 10,
    sets: 4,
    breakTime: 90,
    youtubeUrl: "https://www.youtube.com/watch?v=SCVCLChPQFY",
    thumbnail: "https://img.youtube.com/vi/SCVCLChPQFY/hqdefault.jpg",
  },
  {
    name: "Plank",
    muscle: "Core",
    reps: 1,
    sets: 3,
    breakTime: 45,
    youtubeUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    thumbnail: "https://img.youtube.com/vi/ASdvN_XEl_c/hqdefault.jpg",
  },
  {
    name: "Lunges",
    muscle: "Legs",
    reps: 12,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
    thumbnail: "https://img.youtube.com/vi/QOVaHwm-Q6U/hqdefault.jpg",
  },
  {
    name: "Burpees",
    muscle: "Full Body",
    reps: 10,
    sets: 3,
    breakTime: 90,
    youtubeUrl: "https://www.youtube.com/watch?v=dZgVxmf6jkA",
    thumbnail: "https://img.youtube.com/vi/dZgVxmf6jkA/hqdefault.jpg",
  },
  {
    name: "Bodyweight Squat",
    muscle: "Legs",
    reps: 12,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=aclHkVaku9U",
    thumbnail: "https://img.youtube.com/vi/aclHkVaku9U/hqdefault.jpg",
  },
  {
    name: "Dumbbell Row",
    muscle: "Back",
    reps: 10,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=roCP6wCXPqo",
    thumbnail: "https://img.youtube.com/vi/roCP6wCXPqo/hqdefault.jpg",
  },
  {
    name: "Jumping Jacks",
    muscle: "Full Body",
    reps: 30,
    sets: 3,
    breakTime: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=c4DAnQ6DtF8",
    thumbnail: "https://img.youtube.com/vi/c4DAnQ6DtF8/hqdefault.jpg",
  },
  {
    name: "High Knees",
    muscle: "Full Body",
    reps: 20,
    sets: 3,
    breakTime: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=ZZZoCNMU48U",
    thumbnail: "https://img.youtube.com/vi/ZZZoCNMU48U/hqdefault.jpg",
  },
  {
    name: "Mountain Climbers",
    muscle: "Core / Full Body",
    reps: 20,
    sets: 3,
    breakTime: 30,
    youtubeUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM",
    thumbnail: "https://img.youtube.com/vi/nmwgirgXLYM/hqdefault.jpg",
  },
  {
    name: "Overhead Press",
    muscle: "Shoulders",
    reps: 10,
    sets: 3,
    breakTime: 75,
    youtubeUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    thumbnail: "https://img.youtube.com/vi/2yjwXTZQDDI/hqdefault.jpg",
  },
  {
    name: "Incline Dumbbell Press",
    muscle: "Chest",
    reps: 10,
    sets: 3,
    breakTime: 75,
    youtubeUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    thumbnail: "https://img.youtube.com/vi/8iPEnn-ltC8/hqdefault.jpg",
  },
  {
    name: "Tricep Pushdown",
    muscle: "Triceps",
    reps: 12,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU",
    thumbnail: "https://img.youtube.com/vi/2-LAMcpzODU/hqdefault.jpg",
  },
  {
    name: "Lateral Raise",
    muscle: "Shoulders",
    reps: 15,
    sets: 3,
    breakTime: 45,
    youtubeUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    thumbnail: "https://img.youtube.com/vi/3VcKaXpzqRo/hqdefault.jpg",
  },
  {
    name: "Barbell Row",
    muscle: "Back",
    reps: 8,
    sets: 4,
    breakTime: 90,
    youtubeUrl: "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
    thumbnail: "https://img.youtube.com/vi/FWJR5Ve8bnQ/hqdefault.jpg",
  },
  {
    name: "Lat Pulldown",
    muscle: "Back",
    reps: 10,
    sets: 3,
    breakTime: 75,
    youtubeUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    thumbnail: "https://img.youtube.com/vi/CAwf7n6Luuc/hqdefault.jpg",
  },
  {
    name: "Face Pull",
    muscle: "Shoulders / Back",
    reps: 15,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=rep-qVOkqgk",
    thumbnail: "https://img.youtube.com/vi/rep-qVOkqgk/hqdefault.jpg",
  },
  {
    name: "Barbell Curl",
    muscle: "Biceps",
    reps: 12,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=kwG2ipFRgfo",
    thumbnail: "https://img.youtube.com/vi/kwG2ipFRgfo/hqdefault.jpg",
  },
  {
    name: "Dumbbell Curl",
    muscle: "Biceps",
    reps: 12,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
    thumbnail: "https://img.youtube.com/vi/ykJmrZ5v0Oo/hqdefault.jpg",
  },
  {
    name: "Skull Crusher",
    muscle: "Triceps",
    reps: 12,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=d_KZxkY_0cM",
    thumbnail: "https://img.youtube.com/vi/d_KZxkY_0cM/hqdefault.jpg",
  },
  {
    name: "Barbell Squat",
    muscle: "Legs",
    reps: 6,
    sets: 4,
    breakTime: 120,
    youtubeUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    thumbnail: "https://img.youtube.com/vi/ultWZbUMPL8/hqdefault.jpg",
  },
  {
    name: "Romanian Deadlift",
    muscle: "Hamstrings / Glutes",
    reps: 10,
    sets: 3,
    breakTime: 90,
    youtubeUrl: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
    thumbnail: "https://img.youtube.com/vi/JCXUYuzwNrM/hqdefault.jpg",
  },
  {
    name: "Leg Press",
    muscle: "Legs",
    reps: 12,
    sets: 3,
    breakTime: 75,
    youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
    thumbnail: "https://img.youtube.com/vi/IZxyjW7MPJQ/hqdefault.jpg",
  },
  {
    name: "Leg Curl",
    muscle: "Hamstrings",
    reps: 12,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
    thumbnail: "https://img.youtube.com/vi/1Tq3QdYUuHs/hqdefault.jpg",
  },
  {
    name: "Calf Raise",
    muscle: "Calves",
    reps: 15,
    sets: 4,
    breakTime: 45,
    youtubeUrl: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
    thumbnail: "https://img.youtube.com/vi/gwLzBJYoWlI/hqdefault.jpg",
  },
  {
    name: "Cable Crunch",
    muscle: "Core",
    reps: 15,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=2fbujeH3F0E",
    thumbnail: "https://img.youtube.com/vi/2fbujeH3F0E/hqdefault.jpg",
  },
  {
    name: "Russian Twist",
    muscle: "Core",
    reps: 20,
    sets: 3,
    breakTime: 45,
    youtubeUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI",
    thumbnail: "https://img.youtube.com/vi/wkD8rjkodUI/hqdefault.jpg",
  },
  {
    name: "Hanging Leg Raise",
    muscle: "Core",
    reps: 12,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=hdng3Nm1x_E",
    thumbnail: "https://img.youtube.com/vi/hdng3Nm1x_E/hqdefault.jpg",
  },
  {
    name: "Back Extension",
    muscle: "Lower Back",
    reps: 15,
    sets: 3,
    breakTime: 60,
    youtubeUrl: "https://www.youtube.com/watch?v=ph3pddpKzzw",
    thumbnail: "https://img.youtube.com/vi/ph3pddpKzzw/hqdefault.jpg",
  },
];
*/

const emptyForm = () => ({
  name: "",
  // youtubeUrl: "",  //our current database doesnt have a row for it ill add it when i can but probably not until after mock demo [ jack 4/9 ]
  sets: "",
  reps: "",
  breakTime: "",
  // weight: "",  // same with this ^^^
});

function CustomWorkout() {
  const navigate = useNavigate();
  const { addWorkout } = useContext(WorkoutContext);

  const [workoutName, setWorkoutName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [addedExercises, setAddedExercises] = useState([]);
  const [nameError, setNameError] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);


  // fetches exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/workout/custom");

        const data = await res.json();

        setExercises(data.data);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch(err){
        console.error(err);
      }
    };

    fetchExercises();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustom = () => {
    if (!form.name || !form.sets || !form.reps) return;
    setAddedExercises((prev) => [...prev, { ...form }]);
    setForm(emptyForm());
  };

  const handleAddCommon = (exercise) => {
    const alreadyAdded = addedExercises.some((ex) => ex.name === exercise.name);
    if (alreadyAdded) return;
    setAddedExercises((prev) => [
      ...prev,
      {
        exercise_id: exercise.exercise_id,
        name: exercise.name,
        category: exercise.category,
        equipment: exercise.equipment,
        instructions: exercise.instructions,
        //youtubeUrl: exercise.youtubeUrl,
        //sets: exercise.sets,
        //reps: exercise.reps,
        //breakTime: exercise.breakTime,
        //weight: "",
      },
    ]);
  };

  const handleRemove = (index) => {
    setAddedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditExercise = (index, field, value) => {
    setAddedExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };


  // changed to post and save workout to db
  const handleFinish = async () => {
    if (!workoutName) {
      setNameError(true);
      return;
    }
    if (addedExercises.length === 0) return;
    
    const formattedExercises = addedExercises.map((ex) => ({
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
    }));

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/workout/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: workoutName,
          description: "",
          estimated_minutes: 60,
          exercises: formattedExercises,
        }),
      }); 

      const data = await res.json();
      console.log(data) // should say "Workout created successfully" along with data
      

      //reset everything
      setWorkoutName("");
      setAddedExercises([]);
      setIsPublic(false);
      setNameError(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2500);
    } catch(err) {
      console.error(err);
    }
    //addWorkout({ name: workoutName, isPublic, exercises: addedExercises });
    

   
  };

  return (
    <div className="custom-workout-page">
      {showSaved && <div className="cw-saved-toast">✓ Workout Saved!</div>}

      <div className="cw-topbar">
        <button className="cw-back-btn" onClick={() => navigate("/workouts")}>← Back</button>
        <h2 className="cw-title">Custom Workout</h2>
      </div>

      <div className="cw-workout-meta">
        <div className="cw-meta-name-row">
          <div className="cw-meta-left">
            <label className="cw-meta-label">Workout Name</label>
            <input
              className={`cw-meta-input ${nameError ? "cw-input-error" : ""}`}
              type="text"
              placeholder="e.g. Morning Push Day"
              value={workoutName}
              onChange={(e) => { setWorkoutName(e.target.value); setNameError(false); }}
            />
          </div>
          <div className="cw-visibility-row">
            <span className="cw-visibility-label">{isPublic ? "Public" : "Private"}</span>
            <div
              className={`cw-slider ${isPublic ? "cw-slider-on" : ""}`}
              onClick={() => setIsPublic((prev) => !prev)}
            >
              <div className="cw-slider-thumb" />
            </div>
          </div>
        </div>

        {addedExercises.length > 0 && (
          <div className="cw-added-list">
            <h3 className="cw-section-title">Your Exercises</h3>
            {addedExercises.map((ex, i) => (
              <div key={i} className="cw-added-item">
                <div className="cw-added-info">
                  <span className="cw-added-name">{ex.name}</span>
                  {ex.youtubeUrl && (
                    <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" className="cw-yt-link">Watch on YouTube</a>
                  )}
                  <div className="cw-added-edit-row">
                    <div className="cw-added-edit-group">
                      <label>Sets</label>
                      <input type="number" min="1" value={ex.sets} onChange={(e) => handleEditExercise(i, "sets", e.target.value)} />
                    </div>
                    <div className="cw-added-edit-group">
                      <label>Reps</label>
                      <input type="number" min="1" value={ex.reps} onChange={(e) => handleEditExercise(i, "reps", e.target.value)} />
                    </div>
                    <div className="cw-added-edit-group">
                      <label>Rest (s)</label>
                      <input type="number" min="0" value={ex.breakTime} onChange={(e) => handleEditExercise(i, "breakTime", e.target.value)} />
                    </div>
                  </div>
                </div>
                <button className="cw-remove-btn" onClick={() => handleRemove(i)}>✕</button>
              </div>
            ))}
            <button className="cw-finish-btn" onClick={handleFinish}>Finished</button>
          </div>
        )}
      </div>

      <div className="cw-layout">

        <div className="cw-right">
          <h3 className="cw-section-title">Common Exercises</h3>
          <div className="cw-cards-grid">
            {exercises.map((ex, i) => {
              const added = addedExercises.some((a) => a.name === ex.name);
              return (
                <div key={i} className={`cw-exercise-card ${added ? "cw-card-added" : ""}`}>
                  <a href= "#">
                    <img src="/placeholder.png" alt={ex.name} className="cw-card-thumbnail" />
                  </a>
                  <div className="cw-card-info">
                    <span className="cw-card-name">{ex.name}</span>
                    <span className="cw-card-muscle">{ex.pirmary_muscle}</span>
                    <span className="cw-card-meta"> Category: {ex.category} · Equipment: {ex.equipment} </span>
                  </div>
                  <button className="cw-card-add-btn" onClick={() => handleAddCommon(ex)} disabled={added}>
                    {added ? "Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cw-left">
          <h3 className="cw-section-title">Add Exercise</h3>

          <div className="cw-form">
            <div className="cw-form-group">
              <label>Exercise Name</label>
              <input name="name" type="text" placeholder="e.g. Cable Fly" value={form.name} onChange={handleChange} />
            </div>

            <div className="cw-form-group">
              <label>YouTube Link</label>
              <input name="youtubeUrl" type="text" placeholder="https://youtube.com/..." value={form.youtubeUrl} onChange={handleChange} />
            </div>

            <div className="cw-form-row">
              <div className="cw-form-group">
                <label>Sets</label>
                <input name="sets" type="number" placeholder="3" min="1" value={form.sets} onChange={handleChange} />
              </div>
              <div className="cw-form-group">
                <label>Reps</label>
                <input name="reps" type="number" placeholder="10" min="1" value={form.reps} onChange={handleChange} />
              </div>
              <div className="cw-form-group">
                <label>Rest (sec)</label>
                <input name="breakTime" type="number" placeholder="60" min="0" value={form.breakTime} onChange={handleChange} />
              </div>
              <div className="cw-form-group">
                <label>Weight (lbs)</label>
                <input name="weight" type="number" placeholder="0" min="0" value={form.weight} onChange={handleChange} />
              </div>
            </div>

            <button className="cw-add-btn" onClick={handleAddCustom}>Add Exercise</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomWorkout;
