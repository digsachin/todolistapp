import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
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

    await addDoc(collection(db, "notes"), {
      userId: user.uid,
      title: newNote.title.trim() || 'Untitled',
      content: newNote.content.trim(),
      order: notes.length,
      createdAt: new Date().toISOString(),
    });

    setNewNote({ title: '', content: '' });
  };

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "notes", id));
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

      <Reorder.Group axis="y" values={notes} onReorder={setNotes} className="notes-grid">
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
