import { useState } from 'react';
import { PRIORITIES, PRIORITY_DISPLAY_NAMES } from '../workflowConfig.js';

const TaskForm = ({ initialTask = null, onSubmit, onCancel, isLoading = false, assigneeOptions = [] }) => {
  const [formData, setFormData] = useState(
    initialTask || {
      title: '',
      description: '',
      priority: PRIORITIES.MEDIUM,
      assignee: '',
      dueDate: ''
    }
  );

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!formData.assignee.trim()) {
      newErrors.assignee = 'Assignee is required';
    }
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} aria-label="Task form">
      <div className="form-group">
        <label htmlFor="title">Task Title *</label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          disabled={isLoading}
          aria-required="true"
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <span id="title-error" className="error-message" role="alert">
            {errors.title}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows="4"
          disabled={isLoading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={isLoading}
          >
            {Object.entries(PRIORITIES).map(([key, value]) => (
              <option key={key} value={value}>
                {PRIORITY_DISPLAY_NAMES[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="assignee">Assignee *</label>
          {assigneeOptions.length > 0 ? (
            <select
              id="assignee"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              disabled={isLoading}
              aria-required="true"
              aria-describedby={errors.assignee ? 'assignee-error' : undefined}
            >
              <option value="">Select employee</option>
              {assigneeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="assignee"
              type="text"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              placeholder="Enter assignee name"
              disabled={isLoading}
              aria-required="true"
              aria-describedby={errors.assignee ? 'assignee-error' : undefined}
            />
          )}
          {errors.assignee && (
            <span id="assignee-error" className="error-message" role="alert">
              {errors.assignee}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          disabled={isLoading}
          aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
        />
        {errors.dueDate && (
          <span id="dueDate-error" className="error-message" role="alert">
            {errors.dueDate}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
