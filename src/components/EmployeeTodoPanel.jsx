import { WORKFLOW_STATES } from '../workflowConfig.js';

const normalizeText = (value) => (value || '').trim().toLowerCase();

const EmployeeTodoPanel = ({ tasks, currentUser, onToggleTaskComplete, isLoading = false }) => {
  const mine = tasks.filter((task) => {
    const assignee = normalizeText(task.assignee);
    return assignee === normalizeText(currentUser.displayName) || assignee === normalizeText(currentUser.username);
  });

  const completedCount = mine.filter((task) => task.status === WORKFLOW_STATES.COMPLETED).length;
  const progress = mine.length ? Math.round((completedCount / mine.length) * 100) : 0;

  return (
    <section className="employee-todo" aria-label="My to-do list">
      <div className="employee-todo-header">
        <h3>My Todo List</h3>
        <span className="todo-meta">
          {completedCount}/{mine.length} completed
        </span>
      </div>

      <div className="progress-bar todo-progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`My task completion: ${progress}%`}
        />
      </div>
      <p className="progress-text">{progress}% Complete</p>

      {mine.length === 0 ? (
        <p className="todo-empty">No tasks assigned yet.</p>
      ) : (
        <ul className="todo-list">
          {mine.map((task) => {
            const checked = task.status === WORKFLOW_STATES.COMPLETED;
            return (
              <li key={task.id} className="todo-item">
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onToggleTaskComplete(task, event.target.checked)}
                    disabled={isLoading}
                  />
                  <span className={checked ? 'todo-complete' : ''}>{task.title}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default EmployeeTodoPanel;
