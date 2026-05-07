import React, { useState, useEffect } from "react";
import "../../styles/AdminExercise.css"

function AdminExercise(){
    const [exercise, setExercise]=useState([]);
    const [editExercise, setEditExercise] = useState(null);
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState(""); 
    const [pendingEditConfirm, setPendingEditConfirm] = useState(false);
    const [editSuccessModal, setEditSuccessModal] = useState(false);
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

            setPendingEditConfirm(false);
            setEditExercise(null);
            setEditSuccessModal(true);

        } catch (err) {
            console.error("Edit failed:", err);
            setPendingEditConfirm(false);
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
                prev.map((e) =>
                e.exercise_id === id ? { ...e, is_active: false } : e
            ));

        } catch (err) {
            console.error(err);
        }
    };

    const handleReactivate = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:4000/admin/exercises/${id}/reactivate`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Reactivate failed");

            setExercise((prev) =>
                prev.map((e) =>
                    e.exercise_id === id ? { ...e, is_active: true } : e
                )
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
                <label>Exercise Name</label>
                <input
                type="exerciseName"
                name="exerciseName"
                placeholder="Enter Exercise Name"
                onChange={(e) =>
                    setNewExercise({ ...newExercise, name: e.target.value })
                }
                />
                <label>Category</label>
                <input
                type="exerciseCategory"
                name="exerciseCategory"
                placeholder="Enter Exercise Category"
                onChange={(e) =>
                    setNewExercise({ ...newExercise, category: e.target.value })
                }
                />
                <label>Equipment</label>
                <input
                type="equipment"
                name="equipment"
                placeholder="Enter Equipment"
                onChange={(e) =>
                    setNewExercise({ ...newExercise, equipment: e.target.value })
                }
                />
                <label>Primary Muscles</label>
                <input
                type="primaryMuscles"
                name="primaryMuscles"
                placeholder="Enter Primary Muscles"
                onChange={(e) =>
                    setNewExercise({ ...newExercise, pirmary_muscles: e.target.value })
                }
                />
                <label>Instructions</label>
                <input
                type="instructions"
                name="instructions"
                placeholder="Enter Instructions"
                onChange={(e) =>
                    setNewExercise({ ...newExercise, instructions: e.target.value })
                }
                />
                <label>Image Url</label>
                <input
                type="imageURL"
                name="imageURL"
                placeholder="Enter Image URL"
                onChange={(e) =>
                    setNewExercise({ ...newExercise, image_url: e.target.value })
                }
                />
                <label>Video Url</label>
                <input
                type="videoURL"
                name="videoURL"
                placeholder="Enter Video URL"
                onChange={(e) =>
                    setNewExercise({ ...newExercise, video_url: e.target.value })
                }
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
                                {!e.is_active && (
                                <span className="deactivated-badge">Deactivated</span>
                                )}
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
                                {e.is_active ? (
                                    <button
                                    className="delete-exercise-btn"
                                    onClick={() => handleDelete(e.exercise_id)}>
                                        Deactivate
                                    </button>
                                ) : (                                    
                                    <button
                                    className="reactivate-exercise-btn"
                                    onClick={() => handleReactivate(e.exercise_id)}>
                                        Reactivate
                                    </button>
                                )}
                            </td>
                        </tr>
                        ))}
                </tbody>
            </table>
            {editExercise && (
                <div className="modal-overlay" onClick={() => setEditExercise(null)}>
                    <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>
                            Edit Exercise
                        </h2>
                        <p>
                            <strong>Exercise Name</strong>
                        </p>
                        <input
                        className="exercise-modal-input"
                        value={editExercise.name || ""}
                        onChange={(e) =>
                            setEditExercise({ ...editExercise, name: e.target.value })
                        }
                        placeholder="Name"
                        />
                        <p>
                            <strong>Category</strong>
                        </p>
                        <input
                        className="exercise-modal-input"
                        value={editExercise.category || ""}
                        onChange={(e) =>
                            setEditExercise({ ...editExercise, category: e.target.value })
                        }
                        placeholder="Category"
                        />
                        <p>
                            <strong>Equipment</strong>
                        </p>
                        <input
                        className="exercise-modal-input"
                        value={editExercise.equipment || ""}
                        onChange={(e) =>
                            setEditExercise({ ...editExercise, equipment: e.target.value })
                        }
                        placeholder="Equipment"
                        />
                        <p>
                            <strong>Primary Muscles</strong>
                        </p>
                        <input
                        className="exercise-modal-input"
                        value={editExercise.pirmary_muscles || ""}
                        onChange={(e) =>
                            setEditExercise({...editExercise, pirmary_muscles: e.target.value,})
                        }
                        placeholder="Muscles"
                        />
                        <div className="edit-footer">
                        <button className="modal-btn2 save-change-btn" onClick={() => setPendingEditConfirm(true)}>
                            Save Changes
                        </button>
                        <button className="modal-btn2 cancel-btn" onClick={() => setEditExercise(null)}>
                            Cancel
                        </button>
                        </div>
                    </div>
                </div>
            )}
            {pendingEditConfirm && (
                <div
                className="modal-overlay"
                onClick={() => setPendingEditConfirm(false)}>
                    <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Confirm Changes</h2>
                        <p>Are you sure you want to save these changes?</p>
                        <div className="report-btn-footer">
                            <button
                            className="report-back-btn"
                            onClick={() => setPendingEditConfirm(false)}>
                                Cancel
                            </button>
                            <button
                            className="viewreport-btn"
                            onClick={handleEditExercise}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editSuccessModal && (
                <div
                className="modal-overlay"
                onClick={() => setEditSuccessModal(false)}>
                    <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Changes Saved</h2>
                        <p>The exercise has been updated successfully.</p>
                            <div className="report-btn-footer">
                            <button
                            className="viewreport-btn"
                            onClick={() => setEditSuccessModal(false)}>
                                OK
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