import { useState, useEffect, useMemo } from 'react';
import './index.css';
import Header from './components/Header';
import TodoInput from './components/TodoInput';
import FilterBar from './components/FilterBar';
import TodoList from './components/TodoList';
import Stats from './components/Stats';

const STORAGE_KEY = 'react_todos_v1';

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [filter, setFilter] = useState('all');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // Add a new todo
  const addTodo = (text, priority) => {
    const newTodo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  // Toggle completion
  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  };

  // Delete a todo
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Edit a todo's text
  const editTodo = (id, newText) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, text: newText.trim() } : t)
    );
  };

  // Clear all completed todos
  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
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
          onToggle={toggleTodo}
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
