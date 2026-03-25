import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import TodoInput from '../components/TodoInput';
import FilterBar from '../components/FilterBar';
import TodoList from '../components/TodoList';
import Stats from '../components/Stats';
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

export default function Todos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');

  // Sync with Firestore
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "todos"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  // Add a new todo
  const addTodo = async (text, priority) => {
    await addDoc(collection(db, "todos"), {
      userId: user.uid,
      text: text.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    });
  };

  // Toggle completion
  const toggleTodo = async (id, currentStatus) => {
    await updateDoc(doc(db, "todos", id), {
      completed: !currentStatus
    });
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  // Edit a todo's text
  const editTodo = async (id, newText) => {
    await updateDoc(doc(db, "todos", id), {
      text: newText.trim()
    });
  };

  // Clear all completed todos
  const clearCompleted = async () => {
    const completed = todos.filter(t => t.completed);
    for (const todo of completed) {
      await deleteDoc(doc(db, "todos", todo.id));
    }
  };

  // Derived counts
  const counts = useMemo(() => ({
    all: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }), [todos]);

  // Filtered list
  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);

  const completionPct = todos.length === 0 ? 0
    : Math.round((counts.completed / todos.length) * 100);

  return (
    <div className="app">
      <div className="glass">
        <Header total={counts.all} active={counts.active} />
        <TodoInput onAdd={addTodo} />

        {/* Progress bar */}
        {todos.length > 0 && (
          <div className="progress-wrap">
            <div className="progress-info">
              <span>{counts.completed} of {counts.all} completed</span>
              <span>{completionPct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        )}
      </div>

      <FilterBar filter={filter} setFilter={setFilter} counts={counts} />

      <div className="glass">
        <TodoList
          todos={filteredTodos}
          filter={filter}
          onToggle={(id) => {
            const todo = todos.find(t => t.id === id);
            toggleTodo(id, todo.completed);
          }}
          onDelete={deleteTodo}
          onEdit={editTodo}
        />
        {todos.length > 0 && (
          <Stats
            active={counts.active}
            completed={counts.completed}
            onClearCompleted={clearCompleted}
          />
        )}
      </div>
    </div>
  );
}
