import { useMemo, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskBoard from '../components/TaskBoard';
import TaskCreationModal from '../components/TaskCreationModal';

function ManagerDashboard() {
  const {
    state,
    createTask,
    updateTask,
    deleteTask,
    addEmployee,
    setTaskStatus,
    addTaskComment,
    toggleSubtask,
    addSubtask,
    addCalendarEvent,
    deleteCalendarEvent,
    exportBackupData,
    importBackupData,
    getTaskCompletionBlocker
  } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [employeeError, setEmployeeError] = useState('');
  const importRef = useRef(null);

  const employees = useMemo(() => state.users.filter((user) => user.role === 'Employee'), [state.users]);

  const usersById = useMemo(() => {
    return state.users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }, [state.users]);

  const leaderboard = useMemo(() => {
    return employees
      .map((employee) => {
        const total = state.tasks.filter((task) => task.assignedTo === employee.id).length;
        const completed = state.tasks.filter(
          (task) => task.assignedTo === employee.id && task.status === 'Completed'
        ).length;
        return {
          id: employee.id,
          name: employee.name,
          total,
          completed
        };
      })
      .sort((a, b) => b.completed - a.completed);
  }, [employees, state.tasks]);

  const topPerformer = leaderboard[0];

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleSaveTask = async (taskPayload) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskPayload);
      return;
    }
    await createTask(taskPayload);
  };

  const handleEmployeeInput = (event) => {
    const { name, value } = event.target;
    setEmployeeForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setEmployeeError('');
  };

  const handleAddEmployee = (event) => {
    event.preventDefault();
    setEmployeeError('');
    try {
      addEmployee(employeeForm);
      setEmployeeForm({
        name: '',
        username: '',
        password: ''
      });
    } catch (err) {
      setEmployeeError(err.message || 'Unable to add employee.');
    }
  };

  const handleExportCsv = () => {
    const header = ['ID', 'Title', 'Status', 'Priority', 'Deadline', 'Assignee', 'Labels'];
    const rows = state.tasks.map((task) => {
      const assignee = usersById[task.assignedTo]?.name || 'Unknown';
      const labels = (task.labels || []).join('|');
      return [
        task.id,
        task.title,
        task.status,
        task.priority,
        task.deadline,
        assignee,
        labels
      ];
    });

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'task-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const reportWindow = window.open('', '_blank', 'width=960,height=700');
    if (!reportWindow) {
      return;
    }

    const reportRows = state.tasks
      .map((task) => {
        const assignee = usersById[task.assignedTo]?.name || 'Unknown';
        return `<tr><td>${task.title}</td><td>${task.status}</td><td>${task.priority}</td><td>${task.deadline}</td><td>${assignee}</td></tr>`;
      })
      .join('');

    reportWindow.document.write(`
      <html>
        <head>
          <title>Task Workflow Report</title>
          <style>
            body { font-family: Segoe UI, sans-serif; padding: 24px; }
            h1 { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #eef2ff; }
          </style>
        </head>
        <body>
          <h1>Task Workflow Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr><th>Task</th><th>Status</th><th>Priority</th><th>Deadline</th><th>Assignee</th></tr>
            </thead>
            <tbody>
              ${reportRows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  const handleExportJson = () => {
    const backup = exportBackupData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-workflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const triggerImport = () => {
    if (importRef.current) {
      importRef.current.value = '';
      importRef.current.click();
    }
  };

  const handleImportJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      importBackupData(parsed);
    } catch (error) {
      setEmployeeError(error.message || 'Invalid backup file.');
    }
  };

  return (
    <section className="page-shell">
      <header className="page-top">
        <h1>Manager Dashboard</h1>
        <div className="page-top-actions">
          <button type="button" className="secondary-btn" onClick={handleExportCsv}>
            Export CSV
          </button>
          <button type="button" className="secondary-btn" onClick={handleExportPdf}>
            Export PDF
          </button>
          <button type="button" className="secondary-btn" onClick={handleExportJson}>
            Export JSON
          </button>
          <button type="button" className="secondary-btn" onClick={triggerImport}>
            Import JSON
          </button>
          <button type="button" className="primary-btn" onClick={openCreateModal}>
            Create Task
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            onChange={handleImportJson}
            className="hidden-input"
            aria-label="Import backup"
          />
        </div>
      </header>

      <section className="manager-tools">
        <h3>Add Employee</h3>
        <form className="employee-form" onSubmit={handleAddEmployee}>
          <input
            name="name"
            placeholder="Employee name"
            value={employeeForm.name}
            onChange={handleEmployeeInput}
            required
          />
          <input
            name="username"
            placeholder="Username"
            value={employeeForm.username}
            onChange={handleEmployeeInput}
            required
          />
          <input
            name="password"
            type="text"
            placeholder="Password"
            value={employeeForm.password}
            onChange={handleEmployeeInput}
            required
          />
          <button type="submit" className="secondary-btn">
            Add Employee
          </button>
        </form>
        {employeeError ? <p className="inline-error">{employeeError}</p> : null}
      </section>

      {topPerformer ? (
        <section className="leaderboard-strip" aria-label="Top performer">
          Top Performer: <strong>{topPerformer.name}</strong> ({topPerformer.completed} completed)
        </section>
      ) : null}

      <TaskBoard
        tasks={state.tasks}
        calendarEvents={state.calendarEvents}
        usersById={usersById}
        employees={employees}
        employeeView={false}
        currentUserId={state.session.userId}
        onSetTaskStatus={setTaskStatus}
        onAddCalendarEvent={addCalendarEvent}
        onDeleteCalendarEvent={deleteCalendarEvent}
        onAddComment={addTaskComment}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        getTaskCompletionBlocker={getTaskCompletionBlocker}
      />

      {isModalOpen ? (
        <TaskCreationModal
          key={editingTask ? editingTask.id : 'new-task'}
          employees={employees}
          isSaving={state.loading}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
          tasks={state.tasks}
          onSubmitTask={handleSaveTask}
        />
      ) : null}
    </section>
  );
}

export default ManagerDashboard;
