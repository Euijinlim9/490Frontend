import { createContext, useState } from "react";

export const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);

  const addWorkout = (workout) => {
    setSavedWorkouts((prev) => [...prev, { id: Date.now(), ...workout }]);
  };

  return (
    <WorkoutContext.Provider value={{ savedWorkouts, addWorkout, activeWorkout, setActiveWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
}
