import React, { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom"; 

function ClientProgress(){
    const { clientUserId } = useParams(); 

    const [client, setClient] = useState(null); 
    const [workoutLogs, setWorkoutLogs] = useState([]); 

    useEffect(() => {
        const token = localStorage.getItem("token"); 

        const fetchClientData = async () => {
            const clientRes = await fetch(
                `http://localhost:4000/api/coach/clients/${clientUserId}`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                        "X-Active-Role": "coach", 
                    },
                }
            ); 

            const workoutRes = await fetch(
                `http://localhost:4000/api/coach/clients/${clientUserId}/workouts/logs`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                        "X-Active_Role": "coach",
                    },
                }
            ); 

            const clientData = await clientRes.json(); 
            const workoutData = await workoutRes.json(); 

            setClient(clientData); 
            setWorkoutLogs(workoutData.data || []); 
        };

        fetchClientData(); 
    }, [clientUserId]); 

    if (!client) return <div>Loading..</div>; 

    return(
        <div className="client-progress-page"> 
          <h1>
            {client.first_name} {client.last_name}
          </h1>

          <section>
            <h2>Client Progress</h2>
            <p>Goal: {client.profile?.goal || "No goal listed"} </p>
            <p>Current Activity: {client.profile?.current_activity || "N/A"}</p>
            <p>Weight: {client.profile?.weight || "N/A"}</p>
            <p>Goal Weight: {client.profile?.goal_weight || "N/A"}</p>
          </section>

          <section>
        <h2>Workout Logs</h2>
        {workoutLogs.length === 0 ? (
          <p>No workout logs yet.</p>
        ) : (
          workoutLogs.map((log) => (
            <div key={log.workout_log_id}>
              <p>{log.Workout?.title}</p>
              <p>{log.date}</p>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Diet Logs</h2>
        <p>Needs backend meal-log endpoint or temporary localStorage setup.</p>
      </section>
    </div>
  );
}

export default ClientProgress;