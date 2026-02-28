import { memo } from 'react';
import { STATE_DISPLAY_NAMES, STATE_COLORS, PRIORITY_DISPLAY_NAMES, PRIORITY_COLORS } from '../workflowConfig.js';

// Memoized task card component for performance optimization
const TaskCard = memo(({ task, onSelectTask }) => {
  const handleStatusClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="task-card"
      onClick={() => onSelectTask && onSelectTask(task)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onSelectTask && onSelectTask(task);
        }
      }}
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span
          className="task-priority"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          title={`Priority: ${PRIORITY_DISPLAY_NAMES[task.priority]}`}
        >
          {PRIORITY_DISPLAY_NAMES[task.priority]}
        </span>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-meta">
        <div className="task-assignee">
          <strong>Assignee:</strong> {task.assignee}
        </div>
        {task.dueDate && (
          <div className="task-due-date">
            <strong>Due:</strong>{' '}
            {new Date(task.dueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        )}
      </div>

      <div className="task-status" onClick={handleStatusClick}>
        <span
          className="status-badge"
          style={{ backgroundColor: STATE_COLORS[task.status] }}
          role="status"
        >
          {STATE_DISPLAY_NAMES[task.status]}
        </span>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
