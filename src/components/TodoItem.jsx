import { useState } from 'react';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const saveEdit = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText);
    } else {
      setEditText(todo.text); // revert if empty
    }
    setEditing(false);
  };

  const handleEditKey = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      setEditText(todo.text);
      setEditing(false);
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {/* Checkbox */}
      <label className="checkbox-wrap">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <div className="custom-check">
          <span className="check-icon">✓</span>
        </div>
      </label>

      {/* Text / Edit input */}
      <div className="todo-content">
        {editing ? (
          <input
            className="edit-input"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={handleEditKey}
            onBlur={saveEdit}
            autoFocus
          />
        ) : (
          <>
            <div
              className="todo-text"
              onDoubleClick={() => !todo.completed && setEditing(true)}
              title="Double-click to edit"
            >
              {todo.text}
            </div>
            <div className="todo-meta">
              <span className={`priority-badge ${todo.priority}`}>
                {todo.priority}
              </span>
              <span className="todo-date">{formatDate(todo.createdAt)}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="actions">
        {editing ? (
          <button className="action-btn save-btn" onClick={saveEdit} title="Save">
            💾
          </button>
        ) : (
          <button
            className="action-btn edit-btn"
            onClick={() => !todo.completed && setEditing(true)}
            title="Edit (double-click also works)"
            disabled={todo.completed}
          >
            ✏️
          </button>
        )}
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(todo.id)}
          title="Delete"
        >
          🗑
        </button>
      </div>
    </li>
  );
}
