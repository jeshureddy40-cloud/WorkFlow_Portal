import { memo, useCallback, useMemo } from 'react';

function TaskItem({ task, onStatusChange }) {
  const checkboxId = `task-checkbox-${task.id}`;
  const isCompleted = task.status === 'Completed';

  const badgeClassName = useMemo(() => {
    if (task.status === 'In Progress') {
      return 'status-badge in-progress';
    }
    if (task.status === 'Completed') {
      return 'status-badge completed';
    }
    return 'status-badge todo';
  }, [task.status]);

  const handleCheckboxChange = useCallback(
    (event) => {
      onStatusChange(task.id, event.target.checked ? 'Completed' : 'Todo');
    },
    [onStatusChange, task.id]
  );

  return (
    <article className="task-item">
      <div className="task-item-main">
        <h4>{task.title}</h4>
        <span className={badgeClassName}>{task.status}</span>
      </div>
      <div className="task-checkbox-wrap">
        <input
          id={checkboxId}
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
          aria-label={`Mark ${task.title} as completed`}
        />
        <label htmlFor={checkboxId}>Completed</label>
      </div>
    </article>
  );
}

export default memo(TaskItem);
