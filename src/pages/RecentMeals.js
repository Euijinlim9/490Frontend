import React, { useEffect, useState } from "react"; 
import "../styles/RecentMeals.css"; 
import { buildBackendUrl } from "../config/api";


function RecentMeals(){
    const [meals, setMeals] = useState([]); 

    useEffect(() => {
        const fetchMealLogs = async () => {
            try {
                const token = localStorage.getItem("token");

                const log = await fetch(buildBackendUrl("/api/logs/meal-log"), {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await log.json();

                if (log.ok) {
                    setMeals(data);
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error("failed to fetch meal logs", err);
            }
        };

        fetchMealLogs();
    }, []);

    const handleDeleteMeal = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(buildBackendUrl(`/api/logs/meal-log/${id}`), {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
            } else {
                console.error(data.error);
            }
        } catch (err) {
            console.error("Failed to delete meal log", err);
        }
    }

    return(
        <div>
            <div className="page-title">Recent Meals</div>

            <div className="meals-container">
            {meals.length === 0 ? (
                <div className="details">No meals have been logged yet.</div>
            ) : ( 
                meals.map((meal, index) => (
                  <div className="meal-card" key={meal.id}> 
                    <button 
                      className="delete-log-btn"
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                        Delete
                    </button>
                    
                    <div className="food-name">{meal.meal?.name}</div>

                    <div className="calories"> 
                        {meal.calories} Calories
                    </div>

                    <div className="details"> 
                      <span className="protein">{meal.protein}g Protein</span>{" "} | {" "}
                      <span className="fiber">{meal.fiber}g Fiber</span>{" "} | {" "}
                      <span className="carbs">{meal.carbs}g Carbs</span>{" "} | {" "}
                      <span className="fats">{meal.fats}g Fats</span>
                    </div>
                  </div>
                ))
            )}
            </div>
        </div>
    ); 
}

export default RecentMeals;