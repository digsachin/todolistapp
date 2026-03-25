import { useState } from 'react';

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text, priority);
    setText('');
    setPriority('medium');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="input-section">
      <div className="input-row">
        <input
          className="todo-input"
          type="text"
          placeholder="What needs to be done?  ✦"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
        />
        <button className="add-btn" onClick={handleAdd} disabled={!text.trim()}>
          <span>＋</span> Add
        </button>
      </div>

      <div className="priority-row">
        <span className="priority-label">Priority</span>
        {PRIORITIES.map(p => (
          <button
            key={p.value}
            className={`priority-btn ${priority === p.value ? `active-${p.value}` : ''}`}
            onClick={() => setPriority(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
