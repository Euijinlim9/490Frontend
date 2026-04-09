import React, { useEffect, useState } from "react"; 

function RecentWorkouts(){
    const [workouts, setWorkouts] = useState([]); 

    useEffect(() => {
        const savedWorkouts = JSON.parse(localStorage.getItem("loggedWorkouts")) || []; 
        setWorkouts([...savedWorkouts].reverse()); 
    }, []); 

    return(
        <div>
            <h2>Recent Workouts</h2>

            {workouts.length === 0 ? (
                <p>No workouts have been logged yet.</p>
            ) : ( 
                workouts.map((workout, index) => (
                    <div key={index}>
                        <p><strong>{workout.workoutType}</strong></p>
                        <p>{workout.duration} minutes</p>
                        <p>{workout.sets} sets | {workout.reps} reps</p>
                        <hr />
                    </div>
                ))
            )}
        </div>
    ); 
}

export default RecentWorkouts; 