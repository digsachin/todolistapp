export default function Header({ total, active }) {
  return (
    <div className="header">
      <div className="header-left">
        <h1>✦ My Todos</h1>
        <p>Stay focused, get things done.</p>
      </div>
      <div className="header-badge">
        {active} task{active !== 1 ? 's' : ''} left
      </div>
    </div>
  );
}
