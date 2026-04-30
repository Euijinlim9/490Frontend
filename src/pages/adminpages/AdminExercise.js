import React, { useState, useEffect } from "react";
import "../../styles/AdminExercise.css"

function AdminExercise(){
    const [exercise, setExercise]=useState([]);
    const [editExercise, setEditExercise] = useState(null);
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState(""); 
    const [newExercise, setNewExercise] = useState({
        name: "",
        category: "",
        equipment: "",
        pirmary_muscles: "",
        image_url: "",
        video_url: ""
    });

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("http://localhost:4000/admin/exercises", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message);

                setExercise(data.exercises);
            } catch (err) {
                console.error("Fetch exercises failed:", err);
            }
        };

        fetchExercises();
    }, []); 

    const handleAddExercise = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:4000/admin/exercises", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newExercise),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setExercise((prev) => [...prev, data.exercise]);

            setNewExercise({
                name: "",
                category: "",
                equipment: "",
                pirmary_muscles: "",
                instructions: "",
                image_url: "",
                video_url: "",
            });

        } catch (err) {
            console.error("Add exercise failed:", err);
        }
    };

    const handleEditExercise = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!editExercise) return;

            const res = await fetch(
                `http://localhost:4000/admin/exercises/${editExercise.exercise_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editExercise),
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setExercise((prev) =>
                prev.map((ex) =>
                    ex.exercise_id === editExercise.exercise_id ? data.exercise : ex
                )
            );

            setEditExercise(null);

        } catch (err) {
            console.error("Edit failed:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:4000/admin/exercises/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error("Delete failed");

            setExercise((prev) =>
                prev.filter((e) => e.exercise_id !== id)
            );

        } catch (err) {
            console.error(err);
        }
    };

        const handleSearch = () => {
        setSearchQuery(query);
    };

    const filteredExercise = exercise.filter((e) => {
    if (!searchQuery) return true;

    const search = searchQuery.toLowerCase();
    const id = String(e.exercise_id || "");
    const name = (e.name || "").toLowerCase();
    const category = (e.category || "").toLowerCase();
    const equipment = (e.equipment || "").toLowerCase();
    const muscles = (e.pirmary_muscles || "").toLowerCase();

    if (filter === "id"){
        return id.includes(search);
    }

    if (filter === "name") {
      return name.includes(search);
    }

    if (filter === "category") {
      return category.includes(search);
    }

    if (filter === "equipment") {
      return equipment.includes(search);
    }

    if (filter ===
         "muscles") {
      return muscles.includes(search);
    }

    return (
        id.includes(search) ||
        name.includes(search) ||
        category.includes(search) ||
        equipment.includes(search) ||
        muscles.includes(search)
    );
  });

    return(
    <div className="exercise-admin-page">
        <div className="exercise-admin-header">
            <h2>Edit Exercise Bank</h2>
            <div className="search-container">
                    <input
                    type="text"
                    placeholder="Search Exercise"
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                    />
                    
                    <select
                    className="filter-dropdown"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    >
          <option value="" disabled>
            Filter
          </option>
          <option value="id">Exercise ID</option>
          <option value="name">Exercise Name</option>
          <option value="category">Category</option>
          <option value="equipment">Equipment</option>
          <option value="muscles">Primary Muscles</option>
        </select>
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
        </div>
        </div>
        <div className="exercise-admin-container">
        <div className="admin-left-container">
            <h2>ADD EXERCISE</h2>
            <div className="add-exercise-group">
                <label>Exercise ID</label>
                <input
                type="exerciseID"
                name="exerciseID"
                placeholder="Enter Exercise ID"
                />
                <label>Exercise Name</label>
                <input
                type="exerciseName"
                name="exerciseName"
                placeholder="Enter Exercise Name"
                />
                <label>Category</label>
                <input
                type="exerciseCategory"
                name="exerciseCategory"
                placeholder="Enter Exercise Category"
                />
                <label>Equipment</label>
                <input
                type="equipment"
                name="equipment"
                placeholder="Enter Equipment"
                />
                <label>Primary Muscles</label>
                <input
                type="primaryMuscles"
                name="primaryMuscles"
                placeholder="Enter Primary Muscles"
                />
                <label>Instructions</label>
                <input
                type="instructions"
                name="instructions"
                placeholder="Enter Instructions"
                />
                <label>Image Url</label>
                <input
                type="imageURL"
                name="imageURL"
                placeholder="Enter Image URL"
                />
                <label>Video Url</label>
                <input
                type="videoURL"
                name="videoURL"
                placeholder="Enter Video URL"
                />
            </div>

            <button className="add-exercise-btn" onClick={handleAddExercise}>
                + Add Exercise to Catalog
            </button>
        </div>

        <div className="admin-right-container">
            <table className="reports-table">
                <thead>
                    <tr>
                        <th>Exercise ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Equipment</th>
                        <th>Muscles</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredExercise.map((e) => (
                        <tr key={e.exercise_id}>
                            <td>
                                <span className="font-style">
                                {e.exercise_id}
                                </span>
                            </td>
                            <td>
                                <span className="font-style">
                                {e.name}
                                </span>
                            </td>
                            <td>
                                <span className="exercise-badge">
                                {e.category}
                                </span>
                            </td>
                            <td>
                                <span className="exercise-badge">
                                {e.equipment}
                                </span>
                            </td>
                            <td>
                                <span className="exercise-badge">
                                {e.pirmary_muscles}
                                </span>
                            </td>

                            <td>
                                <button className="edit-exercise-btn"onClick={() => setEditExercise(e)}>
                                    Edit
                                </button>
                                <button className="delete-exercise-btn"onClick={() => handleDelete(e.exercise_id)}>
                                Delete
                                </button>
                            </td>
                        </tr>
                        ))}
                </tbody>
            </table>
            {editExercise && (
                <div className="modal-overlay" onClick={() => setEditExercise(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>
                            Edit Exercise
                        </h2>
                        <label>Exercise Name</label>
                        <input
                        value={editExercise.name || ""}
                        onChange={(e) =>
                            setEditExercise({ ...editExercise, name: e.target.value })
                        }
                        placeholder="Name"
                        />
                        <label>Category</label>
                        <input
                        value={editExercise.category || ""}
                        onChange={(e) =>
                            setEditExercise({ ...editExercise, category: e.target.value })
                        }
                        placeholder="Category"
                        />
                        <label>Equipment</label>
                        <input
                        value={editExercise.equipment || ""}
                        onChange={(e) =>
                            setEditExercise({ ...editExercise, equipment: e.target.value })
                        }
                        placeholder="Equipment"
                        />
                        <label>Primary Muscles</label>
                        <input
                        value={editExercise.pirmary_muscles || ""}
                        onChange={(e) =>
                            setEditExercise({...editExercise, pirmary_muscles: e.target.value,})
                        }
                        placeholder="Muscles"
                        />
                        <div className="edit-footer">
                        <button className="modal-btn2 save-change-btn" onClick={handleEditExercise}>
                            Save Changes
                        </button>
                        <button className="modal-btn2 cancel-btn" onClick={() => setEditExercise(null)}>
                            Cancel
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    </div>
    )
}

export default AdminExercise;