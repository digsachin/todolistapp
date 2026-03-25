import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { Reorder } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const reorderRunIdRef = useRef(0);
  const [snapshotError, setSnapshotError] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    // Avoid requiring a Firestore composite index by not mixing `where` + `orderBy`.
    // We'll sort by `order` locally after the snapshot.
    const q = query(
      collection(db, "notes"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const ao = typeof a?.order === "number" ? a.order : Number(a?.order);
            const bo = typeof b?.order === "number" ? b.order : Number(b?.order);
            return (Number.isFinite(ao) ? ao : 0) - (Number.isFinite(bo) ? bo : 0);
          });
        setNotes(next);
        setSnapshotError(null);
      },
      (error) => {
        console.error("Notes snapshot error:", error);
        setSnapshotError(error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;

    // Avoid order collisions after deletes/reorders.
    const maxOrder = notes.reduce((max, n) => {
      const v = typeof n?.order === 'number' ? n.order : Number(n?.order);
      return Number.isFinite(v) ? Math.max(max, v) : max;
    }, -1);

    await addDoc(collection(db, "notes"), {
      userId: user.uid,
      title: newNote.title.trim() || 'Untitled',
      content: newNote.content.trim(),
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    });

    setNewNote({ title: '', content: '' });
  };

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "notes", id));
  };

  const handleReorder = (newNotes) => {
    // Keep local `order` in sync so "Add Note" doesn't reuse stale order values
    // before Firestore snapshot updates arrive.
    const normalizedNotes = newNotes.map((note, index) => ({
      ...note,
      order: index,
    }));

    setNotes(normalizedNotes);

    // Persist the order to Firestore so refresh/mobile stays consistent.
    const runId = ++reorderRunIdRef.current;
    void (async () => {
      try {
        await Promise.all(
          normalizedNotes.map((note, index) =>
            updateDoc(doc(db, "notes", note.id), { order: index })
          )
        );
      } catch (err) {
        // Firestore sync will rehydrate from the snapshot, but keep logs for debugging.
        console.error("Failed to persist note order:", err);
      } finally {
        // No-op: runId is used to ignore stale writes if we extend this later.
        if (reorderRunIdRef.current !== runId) return;
      }
    })();
  };

  return (
    <div className="notes-page">
      {snapshotError && (
        <div
          className="glass"
          style={{
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(244, 63, 94, 0.35)",
            color: "#fecdd3",
            fontSize: 13,
          }}
        >
          Couldn’t load notes.
          <div style={{ marginTop: 6, color: "#fda4af", fontSize: 12, opacity: 0.95 }}>
            {snapshotError?.code ? `Code: ${snapshotError.code}` : null}
            {snapshotError?.message ? ` ${snapshotError.message}` : null}
          </div>
          <div style={{ marginTop: 8, color: "rgba(254, 202, 202, 0.95)", fontSize: 12 }}>
            Check: (1) you're signed in, (2) existing docs have `userId` and it matches your uid, (3) Firestore rules allow reads.
          </div>
        </div>
      )}

      <div className="glass note-input-section">
        <form onSubmit={addNote} className="note-form">
          <input 
            type="text" 
            placeholder="Title"
            className="todo-input note-title-input"
            value={newNote.title}
            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
          />
          <textarea 
            placeholder="Take a note..."
            className="todo-input note-content-input"
            value={newNote.content}
            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
          />
          <div className="note-actions">
            <button type="submit" className="add-btn">
              <Plus size={18} />
              Add Note
            </button>
          </div>
        </form>
      </div>

      <Reorder.Group axis="y" values={notes} onReorder={handleReorder} className="notes-grid">
        {notes.map((note) => (
          <Reorder.Item 
            key={note.id} 
            value={note}
            className="glass note-card"
          >
            <h3>{note.title}</h3>
            <p className="note-content">{note.content}</p>
            <div className="note-footer">
              <button 
                onClick={() => deleteNote(note.id)}
                className="action-btn delete-btn"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
