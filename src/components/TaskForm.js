function TaskForm({ formValues, employees, onInputChange, onSubmit, isSubmitting }) {
  return (
    <form className="task-form" onSubmit={onSubmit} aria-label="Create and assign task form">
      <div className="form-group">
        <label htmlFor="task-title">Task Title</label>
        <input
          id="task-title"
          name="title"
          type="text"
          value={formValues.title}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-employee">Assign To</label>
        <select
          id="task-employee"
          name="employeeId"
          value={formValues.employeeId}
          onChange={onInputChange}
          required
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="task-status">Initial Status</label>
        <select
          id="task-status"
          name="status"
          value={formValues.status}
          onChange={onInputChange}
          required
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <button type="submit" className="primary-btn" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Assign Task'}
      </button>
    </form>
  );
}

export default TaskForm;
