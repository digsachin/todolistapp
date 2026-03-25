import TodoItem from './TodoItem';

const EMPTY_MESSAGES = {
  all: { icon: '📋', msg: 'No todos yet', sub: 'Add your first task above' },
  active: { icon: '🎉', msg: 'All done!', sub: 'No active tasks remaining' },
  completed: { icon: '⏳', msg: 'Nothing completed', sub: 'Complete some tasks to see them here' },
};

export default function TodoList({ todos, filter, onToggle, onDelete, onEdit }) {
  const label = filter === 'all' ? 'All Tasks'
    : filter === 'active' ? 'Active Tasks' : 'Completed Tasks';

  if (todos.length === 0) {
    const { icon, msg, sub } = EMPTY_MESSAGES[filter];
    return (
      <div className="empty-state">
        <span className="empty-icon">{icon}</span>
        <p>{msg}</p>
        <span>{sub}</span>
      </div>
    );
  }

  return (
    <div className="todo-list-wrapper">
      <h3>{label} · {todos.length}</h3>
      <ul className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </div>
  );
}
