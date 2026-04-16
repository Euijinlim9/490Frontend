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

            {meals.length === 0 ? (
                <div className="details">No meals have been logged yet.</div>
            ) : ( 
                meals.map((meal, index) => (
                    <div key={index}>
                        <div className="food-name">{meal.mealName}</div>
                        <div className="details">{meal.calories} Calories</div>
                        <div className="details">{meal.protein}g Protein | {meal.fiber}g Fiber | {meal.carbs}g Carbs | {meal.fats}g Fats</div>
                        <hr />
                    </div>
                ))
            )}
        </div>
    ); 
}

export default RecentMeals; 