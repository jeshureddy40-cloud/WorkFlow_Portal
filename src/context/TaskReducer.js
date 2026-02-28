// Centralized action names keep state updates predictable across the app.
export const ACTIONS = {
  FETCH_TASKS_START: 'FETCH_TASKS_START',
  FETCH_TASKS_SUCCESS: 'FETCH_TASKS_SUCCESS',
  FETCH_TASKS_ERROR: 'FETCH_TASKS_ERROR',
  ADD_TASK_START: 'ADD_TASK_START',
  ADD_TASK_SUCCESS: 'ADD_TASK_SUCCESS',
  ADD_TASK_ERROR: 'ADD_TASK_ERROR',
  UPDATE_TASK_STATUS: 'UPDATE_TASK_STATUS'
};

export const initialTaskState = {
  employees: [],
  tasks: [],
  loading: false,
  error: null
};

// Reducer is the single source of truth for all task/workflow state transitions.
export function taskReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_TASKS_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case ACTIONS.FETCH_TASKS_SUCCESS:
      return {
        ...state,
        employees: action.payload.employees,
        tasks: action.payload.tasks,
        loading: false,
        error: null
      };

    case ACTIONS.FETCH_TASKS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case ACTIONS.ADD_TASK_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case ACTIONS.ADD_TASK_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        tasks: [...state.tasks, action.payload]
      };

    case ACTIONS.ADD_TASK_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case ACTIONS.UPDATE_TASK_STATUS:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, status: action.payload.status } : task
        )
      };

    default:
      return state;
  }
}
