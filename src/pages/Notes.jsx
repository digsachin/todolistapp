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
  doc,
  orderBy
} from 'firebase/firestore';
import { Reorder } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const reorderRunIdRef = useRef(0);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "notes"), 
      where("userId", "==", user.uid),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

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
