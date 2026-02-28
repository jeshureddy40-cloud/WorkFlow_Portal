import { WORKFLOW_STATES, STATE_DISPLAY_NAMES, STATE_COLORS } from '../workflowConfig.js';

const WorkflowStatus = ({ tasks }) => {
  const getTaskCountByStatus = (status) => {
    return tasks.filter(task => task.status === status).length;
  };

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === WORKFLOW_STATES.COMPLETED).length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="workflow-status" role="region" aria-label="Workflow status overview">
      <h3>Workflow Overview</h3>

      <div className="workflow-states-grid">
        {Object.values(WORKFLOW_STATES).map((state) => {
          const count = getTaskCountByStatus(state);
          return (
            <div
              key={state}
              className="workflow-state-card"
            >
              <div
                className="state-indicator"
                style={{ backgroundColor: STATE_COLORS[state] }}
              />
              <div className="state-info">
                <h4>{STATE_DISPLAY_NAMES[state]}</h4>
                <span className="count" role="status">
                  {count} task{count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="completion-section">
        <h4>Overall Progress</h4>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${getCompletionPercentage()}%` }}
            role="progressbar"
            aria-valuenow={getCompletionPercentage()}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Task completion: ${getCompletionPercentage()}%`}
          />
        </div>
        <p className="progress-text">{getCompletionPercentage()}% Complete</p>
      </div>
    </div>
  );
};

export default WorkflowStatus;
