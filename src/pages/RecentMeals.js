import React, { useEffect, useState } from "react"; 

function RecentMeals(){
    const [meals, setMeals] = useState([]); 

    useEffect(() => {
        const savedMeals = JSON.parse(localStorage.getItem("loggedMeals")) || []; 
        setMeals([...savedMeals].reverse()); 
    }, []); 

    return(
        <div>
            <h2>Recent Meals</h2>

            {meals.length === 0 ? (
                <p>No meals have been logged yet.</p>
            ) : ( 
                meals.map((meal, index) => (
                    <div key={index}>
                        <p><strong>{meal.mealName}</strong></p>
                        <p>{meal.calories} calories</p>
                        <p>{meal.protein}g protein | {meal.fiber}g fiber | {meal.carbs}g carbs | {meal.fats}g fats</p>
                        <hr />
                    </div>
                ))
            )}
        </div>
    ); 
}

export default RecentMeals; 