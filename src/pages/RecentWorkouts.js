import React, { useEffect, useState } from "react"; 
import "../styles/RecentWorkouts.css"; 

function RecentWorkouts(){
    const [workouts, setWorkouts] = useState([]); 

    useEffect(() => {
        const savedWorkouts = JSON.parse(localStorage.getItem("loggedWorkouts")) || []; 
        setWorkouts([...savedWorkouts].reverse()); 
    }, []); 

    return(
        <div>
            <div className="page-title">Recent Workouts</div>

            {workouts.length === 0 ? (
                <p>No workouts have been logged yet.</p>
            ) : ( 
                workouts.map((workout, index) => (
                    <div key={index}>
                        <div className="workout-name">{workout.workoutType}</div>
                        <div className="workout-details">{workout.duration} Minutes</div>
                        <div className="workout-details">{workout.sets} Sets | {workout.reps} Reps</div>
                        <hr />
                    </div>
                ))
            )}
        </div>
    ); 
}

export default RecentWorkouts; 