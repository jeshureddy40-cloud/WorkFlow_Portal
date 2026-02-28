import { memo } from 'react';
import TaskItem from './TaskItem';

function EmployeeCard({ employee, tasks, onStatusChange }) {
  return (
    <section className="employee-card" aria-label={`Tasks for ${employee.name}`}>
      <h3>{employee.name}</h3>
      {tasks.length === 0 ? (
        <p className="empty-text">No tasks assigned.</p>
      ) : (
        <div className="employee-task-list">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </section>
  );
}

// Memoization prevents re-renders when employee/task references do not change.
export default memo(EmployeeCard);
