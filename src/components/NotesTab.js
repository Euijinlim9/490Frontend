import { useState, useEffect } from "react";

// Notes tab — list, create, edit, delete coach notes
function NotesTab({ clientUserId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Active-Role": "coach",
  };

  // Load notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/coach/clients/${clientUserId}/notes`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to load notes");
        const data = await res.json();
        setNotes(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientUserId]);

  // Create note
  const handleCreate = async () => {
    if (!newNote.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/clients/${clientUserId}/notes`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ note: newNote.trim() }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create note");
      }
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev]);
      setNewNote("");
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Start editing
  const startEdit = (note) => {
    setEditingId(note.coach_note_id);
    setEditText(note.note);
  };

  // Save edit
  const handleSaveEdit = async (noteId) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/notes/${noteId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ note: editText.trim() }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update note");
      }
      const data = await res.json();
      setNotes((prev) =>
        prev.map((n) => (n.coach_note_id === noteId ? data.note : n))
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete note
  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/notes/${noteId}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete note");
      }
      setNotes((prev) => prev.filter((n) => n.coach_note_id !== noteId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="cd-state">Loading notes…</div>;
  if (error) return <div className="cd-state cd-error">Error: {error}</div>;

  return (
    <div className="cd-notes">
      {/* Compose */}
      <div className="cd-notes-compose">
        <textarea
          className="cd-notes-textarea"
          placeholder="Write a private note about this client…"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          maxLength={5000}
        />
        <div className="cd-notes-compose-footer">
          <span className="cd-notes-charcount">{newNote.length} / 5000</span>
          <button
            className="cd-btn cd-btn-primary"
            onClick={handleCreate}
            disabled={!newNote.trim() || creating}
          >
            {creating ? "Adding…" : "Add Note"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="cd-notes-list">
        {notes.length === 0 ? (
          <div className="cd-empty">
            No notes yet. Add your first observation above.
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.coach_note_id} className="cd-note">
              <div className="cd-note-header">
                <span className="cd-note-date">
                  {new Date(note.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {note.updated_at && note.updated_at !== note.created_at && (
                    <span className="cd-note-edited"> · edited</span>
                  )}
                </span>
                {editingId !== note.coach_note_id && (
                  <div className="cd-note-actions">
                    <button
                      className="cd-note-btn"
                      onClick={() => startEdit(note)}
                    >
                      Edit
                    </button>
                    <button
                      className="cd-note-btn cd-note-btn-danger"
                      onClick={() => handleDelete(note.coach_note_id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === note.coach_note_id ? (
                <div className="cd-note-edit">
                  <textarea
                    className="cd-notes-textarea"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    maxLength={5000}
                  />
                  <div className="cd-note-edit-actions">
                    <button
                      className="cd-btn cd-btn-secondary"
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="cd-btn cd-btn-primary"
                      onClick={() => handleSaveEdit(note.coach_note_id)}
                      disabled={!editText.trim()}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cd-note-body">{note.note}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotesTab;
