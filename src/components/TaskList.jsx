import { memo } from 'react';
import TaskCard from './TaskCard.jsx';
import { WORKFLOW_STATES, STATE_DISPLAY_NAMES } from '../workflowConfig.js';

// Memoized task list component for performance optimization
const TaskList = memo(({ tasks, onSelectTask, groupByStatus = false }) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state" role="status">
        <p className="empty-message">No tasks found. Create one to get started!</p>
      </div>
    );
  }

  if (groupByStatus) {
    const groupedTasks = Object.values(WORKFLOW_STATES).reduce((acc, status) => {
      acc[status] = tasks.filter(task => task.status === status);
      return acc;
    }, {});

    return (
      <div className="task-list-grouped" role="region" aria-label="Tasks grouped by status">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
          statusTasks.length > 0 && (
            <div key={status} className="task-status-group">
              <h3 className="status-group-title">
                {STATE_DISPLAY_NAMES[status]} ({statusTasks.length})
              </h3>
              <div className="task-cards-container">
                {statusTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelectTask={onSelectTask}
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    );
  }

  return (
    <div className="task-list" role="region" aria-label="All tasks">
      <div className="task-cards-container">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </div>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
