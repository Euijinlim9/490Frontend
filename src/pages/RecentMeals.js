import React, { useEffect, useState } from "react"; 
import "../styles/RecentMeals.css"; 

function RecentMeals(){
    const [meals, setMeals] = useState([]); 

    useEffect(() => {
        const savedMeals = JSON.parse(localStorage.getItem("loggedMeals")) || []; 
        setMeals([...savedMeals].reverse()); 
    }, []); 

    return(
        <div>
            <div className="page-title">Recent Meals</div>

            <div className="meals-container">
            {meals.length === 0 ? (
                <div className="details">No meals have been logged yet.</div>
            ) : ( 
                meals.map((meal, index) => (
                  <div className="meal-card" key={index}> 
                    <div className="food-name">{meal.mealName}</div>

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