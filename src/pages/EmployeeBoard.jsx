import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import ErrorMessage from '../components/ErrorMessage';

const statusOrder = ['Todo', 'In Progress', 'Completed'];

function EmployeeBoard({ employees, tasks, onStatusChange }) {
  const { id } = useParams();

  const employee = useMemo(() => employees.find((entry) => entry.id === id), [employees, id]);

  const groupedTasks = useMemo(() => {
    const seed = {
      Todo: [],
      'In Progress': [],
      Completed: []
    };

    tasks
      .filter((task) => task.employeeId === id)
      .forEach((task) => {
        seed[task.status] = [...seed[task.status], task];
      });

    return seed;
  }, [tasks, id]);

  if (!employee) {
    return <ErrorMessage message="Employee not found." />;
  }

  return (
    <section className="page">
      <h1>{employee.name}</h1>
      <p className="page-subtitle">Individual board grouped by task status</p>

      {statusOrder.map((status) => (
        <section key={status} className="status-section">
          <h2>{status}</h2>
          {groupedTasks[status].length === 0 ? (
            <p className="empty-text">No tasks in this status.</p>
          ) : (
            <div className="employee-task-list">
              {groupedTasks[status].map((task) => (
                <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} />
              ))}
            </div>
          )}
        </section>
      ))}
    </section>
  );
}

export default EmployeeBoard;
