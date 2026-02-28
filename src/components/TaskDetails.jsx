import {
  STATE_DISPLAY_NAMES,
  STATE_COLORS,
  STATE_TRANSITIONS,
  PRIORITY_DISPLAY_NAMES,
  PRIORITY_COLORS
} from '../workflowConfig.js';

const TaskDetails = ({ task, onStatusChange, onClose, isLoading = false }) => {
  const validNextStates = STATE_TRANSITIONS[task.status] || [];

  const handleStatusChange = async (newStatus) => {
    onStatusChange(task.id, newStatus);
  };

  return (
    <div className="task-details" role="region" aria-label="Task details">
      <div className="task-details-header">
        <h2>{task.title}</h2>
        <button className="close-button" onClick={onClose} aria-label="Close task details">
          x
        </button>
      </div>

      <div className="task-details-content">
        <div className="details-section">
          <h3>Status</h3>
          <div className="current-status" style={{ backgroundColor: STATE_COLORS[task.status] }}>
            {STATE_DISPLAY_NAMES[task.status]}
          </div>

          {validNextStates.length > 0 && (
            <div className="status-transitions">
              <p>Move to:</p>
              <div className="transition-buttons">
                {validNextStates.map((state) => (
                  <button
                    key={state}
                    onClick={() => handleStatusChange(state)}
                    disabled={isLoading}
                    className="transition-button"
                    style={{ backgroundColor: STATE_COLORS[state] }}
                  >
                    {STATE_DISPLAY_NAMES[state]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="details-section">
          <h3>Priority</h3>
          <span className="priority-badge" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}>
            {PRIORITY_DISPLAY_NAMES[task.priority]}
          </span>
        </div>

        <div className="details-section">
          <h3>Description</h3>
          <p>{task.description || 'No description provided'}</p>
        </div>

        <div className="details-section">
          <h3>Assignee</h3>
          <p>{task.assignee}</p>
        </div>

        {task.dueDate && (
          <div className="details-section">
            <h3>Due Date</h3>
            <p>
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        <div className="details-section">
          <h3>Created</h3>
          <p>
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
