import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskBoard from '../components/TaskBoard';

function EmployeeDashboard() {
  const {
    state,
    setTaskStatus,
    reopenTaskForEmployee,
    addTaskComment,
    toggleSubtask,
    addSubtask,
    addCalendarEvent,
    deleteCalendarEvent,
    getTaskCompletionBlocker
  } = useAppContext();

  const currentEmployeeId = state.session.userId;
  const currentEmployee = state.users.find((user) => user.id === currentEmployeeId);
  const employees = useMemo(() => state.users.filter((user) => user.role === 'Employee'), [state.users]);

  const tasks = useMemo(
    () => state.tasks.filter((task) => task.assignedTo === currentEmployeeId),
    [currentEmployeeId, state.tasks]
  );

  const usersById = useMemo(() => {
    return state.users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }, [state.users]);

  return (
    <section className="page-shell">
      <header className="page-top">
        <h1>Employee Dashboard</h1>
        <p className="muted">{currentEmployee ? currentEmployee.name : 'Employee'}</p>
      </header>
      <TaskBoard
        tasks={tasks}
        calendarEvents={state.calendarEvents}
        usersById={usersById}
        employees={employees}
        employeeView
        currentUserId={currentEmployeeId}
        onSetTaskStatus={setTaskStatus}
        onAddCalendarEvent={addCalendarEvent}
        onDeleteCalendarEvent={deleteCalendarEvent}
        onReopenTask={reopenTaskForEmployee}
        onAddComment={addTaskComment}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
        getTaskCompletionBlocker={getTaskCompletionBlocker}
      />
    </section>
  );
}

export default EmployeeDashboard;
