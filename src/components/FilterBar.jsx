const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function FilterBar({ filter, setFilter, counts }) {
  return (
    <div className="filter-bar glass">
      {FILTERS.map(f => (
        <button
          key={f.key}
          className={`filter-btn ${filter === f.key ? 'active' : ''}`}
          onClick={() => setFilter(f.key)}
        >
          {f.label}
          <span className="count-chip">{counts[f.key]}</span>
        </button>
      ))}
    </div>
  );
}
