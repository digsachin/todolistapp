export default function Stats({ active, completed, onClearCompleted }) {
  return (
    <div className="stats">
      <span className="stats-left">
        <strong>{active}</strong> {active === 1 ? 'item' : 'items'} left
      </span>
      <button
        className="clear-btn"
        onClick={onClearCompleted}
        disabled={completed === 0}
      >
        Clear completed {completed > 0 ? `(${completed})` : ''}
      </button>
    </div>
  );
}
