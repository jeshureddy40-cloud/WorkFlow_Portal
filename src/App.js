import { useCallback, useEffect, useMemo, useReducer } from 'react';
import Navbar from './components/Navbar';
import ProgressBar from './components/ProgressBar';
import ErrorMessage from './components/ErrorMessage';
import AppRoutes from './routes/AppRoutes';
import { ACTIONS, initialTaskState, taskReducer } from './context/TaskReducer';
import { mockEmployees, mockTasks } from './data/mockData';

function App() {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);

  const fetchInitialData = useCallback(() => {
    dispatch({ type: ACTIONS.FETCH_TASKS_START });

    setTimeout(() => {
      if (Math.random() < 0.2) {
        dispatch({
          type: ACTIONS.FETCH_TASKS_ERROR,
          payload: 'Failed to load tasks. Please try again.'
        });
        return;
      }

      dispatch({
        type: ACTIONS.FETCH_TASKS_SUCCESS,
        payload: {
          employees: mockEmployees,
          tasks: mockTasks
        }
      });
    }, 1000);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Stable callback prevents rerenders in memoized employee/task components.
  const handleStatusChange = useCallback((taskId, nextStatus) => {
    dispatch({
      type: ACTIONS.UPDATE_TASK_STATUS,
      payload: {
        id: taskId,
        status: nextStatus
      }
    });
  }, []);

  // Async task creation is simulated to match production-style request flow.
  const handleAddTask = useCallback((taskInput) => {
    dispatch({ type: ACTIONS.ADD_TASK_START });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.2) {
          const message = 'Task assignment failed. Please retry.';
          dispatch({
            type: ACTIONS.ADD_TASK_ERROR,
            payload: message
          });
          reject(new Error(message));
          return;
        }

        const newTask = {
          id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`,
          title: taskInput.title,
          status: taskInput.status,
          employeeId: taskInput.employeeId
        };

        dispatch({
          type: ACTIONS.ADD_TASK_SUCCESS,
          payload: newTask
        });

        resolve(newTask);
      }, 1000);
    });
  }, []);

  // Memoized progress avoids recalculating for unrelated state updates.
  const progressPercentage = useMemo(() => {
    const totalTasks = state.tasks.length;
    if (!totalTasks) {
      return 0;
    }
    const completedTasks = state.tasks.filter((task) => task.status === 'Completed').length;
    return (completedTasks / totalTasks) * 100;
  }, [state.tasks]);

  const hasLoadedData = state.tasks.length > 0 || state.employees.length > 0;

  return (
    <div className="app-shell">
      <Navbar employees={state.employees} />
      <main className="app-main">
        <ProgressBar progress={progressPercentage} />

        {state.error && hasLoadedData ? (
          <ErrorMessage message={state.error} onRetry={fetchInitialData} />
        ) : null}

        <AppRoutes
          employees={state.employees}
          tasks={state.tasks}
          loading={state.loading}
          error={state.error}
          onRetry={fetchInitialData}
          onAddTask={handleAddTask}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  );
}

export default App;
