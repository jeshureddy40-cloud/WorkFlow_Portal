import { useCallback, useState } from 'react';
import TaskForm from '../components/TaskForm';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const initialFormState = {
  title: '',
  employeeId: '',
  status: 'Todo'
};

function ManagerPanel({ employees, loading, error, onAddTask }) {
  const [formValues, setFormValues] = useState(initialFormState);
  const [localError, setLocalError] = useState('');

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
    setLocalError('');
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setLocalError('');

      if (!formValues.title.trim() || !formValues.employeeId) {
        setLocalError('Please fill all required fields.');
        return;
      }

      try {
        await onAddTask({
          title: formValues.title.trim(),
          employeeId: formValues.employeeId,
          status: formValues.status
        });
        setFormValues(initialFormState);
      } catch (submitError) {
        setLocalError(submitError.message || 'Failed to assign task.');
      }
    },
    [formValues, onAddTask]
  );

  return (
    <section className="page">
      <h1>Manager Panel</h1>
      <p className="page-subtitle">Create tasks and assign them to employees</p>

      {loading ? <Loader message="Saving task..." /> : null}
      {localError ? <ErrorMessage message={localError} /> : null}
      {error && !localError ? <ErrorMessage message={error} /> : null}

      <TaskForm
        formValues={formValues}
        employees={employees}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isSubmitting={loading}
      />
    </section>
  );
}

export default ManagerPanel;
