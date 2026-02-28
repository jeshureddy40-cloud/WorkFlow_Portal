import { useState } from 'react';

const getInitialForm = (task) => ({
  title: task?.title || '',
  description: task?.description || '',
  priority: task?.priority || 'Medium',
  deadline: task?.deadline || '',
  assignedTo: task?.assignedTo || '',
  status: task?.status || 'Pending',
  labels: Array.isArray(task?.labels) ? task.labels.join(', ') : '',
  subtasks: Array.isArray(task?.subtasks) ? task.subtasks.map((item) => item.text).join(', ') : '',
  dependencies: Array.isArray(task?.dependencies) ? task.dependencies : []
});

function TaskCreationModal({
  employees,
  tasks = [],
  isSaving,
  onClose,
  onSubmitTask,
  editingTask = null
}) {
  const [form, setForm] = useState(() => getInitialForm(editingTask));
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim() || !form.deadline || !form.assignedTo) {
      setError('All fields are required.');
      return;
    }

    if (new Date(form.deadline).getTime() < Date.now() - 86400000) {
      setError('Deadline cannot be in the past.');
      return;
    }

    try {
      await onSubmitTask({
        ...form,
        labels: form.labels,
        subtasks: form.subtasks,
        dependencies: form.dependencies
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    }
  };

  const availableDependencyTasks = tasks.filter((task) => task.id !== editingTask?.id);

  const isEditMode = Boolean(editingTask);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Task modal">
      <div className="modal-card">
        <header className="modal-header">
          <h3>{isEditMode ? 'Edit Task' : 'Create Task'}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            x
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label htmlFor="taskTitle">Title</label>
          <input id="taskTitle" name="title" value={form.title} onChange={handleChange} required />

          <label htmlFor="taskDescription">Description</label>
          <textarea
            id="taskDescription"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            required
          />

          <label htmlFor="taskPriority">Priority</label>
          <select id="taskPriority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <label htmlFor="taskDeadline">Deadline</label>
          <input id="taskDeadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} required />

          <label htmlFor="taskAssignedTo">Assign To</label>
          <select id="taskAssignedTo" name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>

          <label htmlFor="taskStatus">Initial Status</label>
          <select id="taskStatus" name="status" value={form.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <label htmlFor="taskLabels">Labels</label>
          <input
            id="taskLabels"
            name="labels"
            value={form.labels}
            onChange={handleChange}
            placeholder="UI, Backend, QA"
          />

          <label htmlFor="taskSubtasks">Checklist Items</label>
          <input
            id="taskSubtasks"
            name="subtasks"
            value={form.subtasks}
            onChange={handleChange}
            placeholder="Design, Review, Test"
          />

          <label htmlFor="taskDependencies">Dependencies</label>
          <select
            id="taskDependencies"
            name="dependencies"
            multiple
            value={form.dependencies}
            onChange={(event) => {
              const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
              setForm((prev) => ({
                ...prev,
                dependencies: selected
              }));
            }}
          >
            {availableDependencyTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>

          {error ? <p className="inline-error">{error}</p> : null}

          <button type="submit" className="primary-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TaskCreationModal;
