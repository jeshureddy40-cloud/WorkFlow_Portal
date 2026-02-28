import { useMemo } from 'react';
import EmployeeCard from '../components/EmployeeCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

function Dashboard({ employees, tasks, loading, error, onRetry, onStatusChange }) {
  const employeeTaskMap = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = tasks.filter((task) => task.employeeId === employee.id);
      return acc;
    }, {});
  }, [employees, tasks]);

  if (loading && tasks.length === 0) {
    return <Loader message="Fetching employee tasks..." />;
  }

  if (error && tasks.length === 0) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  return (
    <section className="page">
      <h1>Dashboard</h1>
      <p className="page-subtitle">Manager view of all employees and their tasks</p>
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          tasks={employeeTaskMap[employee.id] || []}
          onStatusChange={onStatusChange}
        />
      ))}
    </section>
  );
}

export default Dashboard;
