import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react';
import { mockTasks, mockUsers } from '../data/mockData';

const STORAGE_KEY = 'task-workflow-portal-v3';
const UNDO_LIMIT = 25;
const TOAST_TIMEOUT_MS = 5500;

const AppContext = createContext(null);

const initialState = {
  initialized: false,
  loading: false,
  error: null,
  users: [],
  tasks: [],
  calendarEvents: [],
  notifications: [],
  theme: 'light',
  session: {
    loggedIn: false,
    userId: '',
    role: ''
  },
  undoStack: [],
  toast: null
};

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeLabels(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
}

function normalizeDependencies(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
}

function normalizeSubtasks(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          const text = item.trim();
          if (!text) {
            return null;
          }
          return {
            id: createId('subtask'),
            text,
            completed: false
          };
        }

        if (!item || typeof item !== 'object') {
          return null;
        }

        const text = String(item.text || '').trim();
        if (!text) {
          return null;
        }

        return {
          id: String(item.id || createId('subtask')),
          text,
          completed: Boolean(item.completed)
        };
      })
      .filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((text) => ({
      id: createId('subtask'),
      text,
      completed: false
    }));
}

function pushHistory(task, entry) {
  return {
    ...task,
    history: [
      {
        id: createId('hist'),
        createdAt: nowIso(),
        meta: {},
        ...entry
      },
      ...(task.history || [])
    ]
  };
}

function sanitizeTask(rawTask) {
  return {
    id: String(rawTask.id || createId('task')),
    title: String(rawTask.title || '').trim(),
    description: String(rawTask.description || '').trim(),
    priority: ['High', 'Medium', 'Low'].includes(rawTask.priority) ? rawTask.priority : 'Medium',
    deadline: rawTask.deadline ? String(rawTask.deadline).slice(0, 10) : '',
    assignedTo: String(rawTask.assignedTo || ''),
    status: ['Pending', 'In Progress', 'Completed'].includes(rawTask.status) ? rawTask.status : 'Pending',
    labels: normalizeLabels(rawTask.labels),
    dependencies: normalizeDependencies(rawTask.dependencies),
    subtasks: normalizeSubtasks(rawTask.subtasks),
    comments: Array.isArray(rawTask.comments) ? rawTask.comments : [],
    history: Array.isArray(rawTask.history) ? rawTask.history : [],
    reopenCount: Number(rawTask.reopenCount || 0),
    createdAt: rawTask.createdAt || nowIso(),
    updatedAt: rawTask.updatedAt || nowIso()
  };
}

function getSeedState() {
  return {
    users: mockUsers.map((user) => ({
      ...user,
      githubUsername: user.githubUsername || '',
      avatarDataUrl: user.avatarDataUrl || ''
    })),
    tasks: mockTasks.map((task) => sanitizeTask(task)),
    calendarEvents: [],
    notifications: [],
    theme: 'light',
    session: {
      loggedIn: false,
      userId: '',
      role: ''
    }
  };
}

function readStoredState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.tasks)) {
      return null;
    }

    return {
      users: parsed.users.map((user) => ({
        ...user,
        githubUsername: user.githubUsername || '',
        avatarDataUrl: user.avatarDataUrl || ''
      })),
      tasks: parsed.tasks.map((task) => sanitizeTask(task)),
      calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      session:
        parsed.session &&
        typeof parsed.session === 'object' &&
        parsed.session.loggedIn &&
        parsed.session.userId &&
        parsed.session.role
          ? parsed.session
          : {
              loggedIn: false,
              userId: '',
              role: ''
            }
    };
  } catch {
    return null;
  }
}

function getCompletionBlocker(task, allTasks) {
  if (!task || task.status === 'Completed') {
    return '';
  }

  const byId = allTasks.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const incompleteDependencies = (task.dependencies || [])
    .map((dependencyId) => byId[dependencyId])
    .filter((dependencyTask) => dependencyTask && dependencyTask.status !== 'Completed');

  if (incompleteDependencies.length > 0) {
    const sample = incompleteDependencies[0];
    return `Complete dependency "${sample.title}" first.`;
  }

  const incompleteSubtasks = (task.subtasks || []).filter((subtask) => !subtask.completed);
  if (incompleteSubtasks.length > 0) {
    return `Finish checklist (${incompleteSubtasks.length} pending).`;
  }

  return '';
}

function appReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        ...action.payload,
        initialized: true,
        loading: false,
        error: null,
        undoStack: []
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'UPDATE_USERS':
      return {
        ...state,
        users: action.updater(state.users)
      };
    case 'UPDATE_TASKS':
      return {
        ...state,
        tasks: action.updater(state.tasks)
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      };
    case 'UPDATE_CALENDAR_EVENTS':
      return {
        ...state,
        calendarEvents: action.updater(state.calendarEvents)
      };
    case 'SET_CALENDAR_EVENTS':
      return {
        ...state,
        calendarEvents: action.payload
      };
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    case 'PUSH_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 150)
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((item) =>
          item.id === action.payload ? { ...item, read: true } : item
        )
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((item) => ({ ...item, read: true }))
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((item) => item.id !== action.payload)
      };
    case 'SET_TOAST':
      return {
        ...state,
        toast: action.payload
      };
    case 'CLEAR_TOAST':
      return {
        ...state,
        toast: null
      };
    case 'PUSH_UNDO':
      return {
        ...state,
        undoStack: [...state.undoStack, action.payload].slice(-UNDO_LIMIT)
      };
    case 'POP_UNDO':
      return {
        ...state,
        undoStack: state.undoStack.slice(0, -1)
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!state.initialized) {
      return;
    }
    const snapshot = {
      users: state.users,
      tasks: state.tasks,
      calendarEvents: state.calendarEvents,
      notifications: state.notifications,
      theme: state.theme,
      session: state.session
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    state.calendarEvents,
    state.initialized,
    state.notifications,
    state.session,
    state.tasks,
    state.theme,
    state.users
  ]);

  useEffect(() => {
    if (!state.toast) {
      return undefined;
    }
    const timer = setTimeout(() => {
      dispatch({ type: 'CLEAR_TOAST' });
    }, TOAST_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state.toast]);

  const pushNotification = useCallback((message, type = 'info') => {
    dispatch({
      type: 'PUSH_NOTIFICATION',
      payload: {
        id: createId('notif'),
        message,
        type,
        read: false,
        createdAt: nowIso()
      }
    });
  }, []);

  const pushUndoToast = useCallback((message) => {
    dispatch({
      type: 'SET_TOAST',
      payload: {
        id: createId('toast'),
        message,
        undoable: true
      }
    });
  }, []);

  const requireManager = useCallback(() => {
    const current = stateRef.current;
    if (current.session.role !== 'Manager') {
      throw new Error('Only manager can perform this action.');
    }
  }, []);

  const initialize = useCallback(() => {
    const current = stateRef.current;
    if (current.initialized) {
      return;
    }
    const stored = readStoredState();
    dispatch({
      type: 'INITIALIZE',
      payload: stored || getSeedState()
    });
  }, []);

  const login = useCallback(({ username, password }) => {
    const current = stateRef.current;
    const safeUsername = String(username || '').trim().toLowerCase();
    const safePassword = String(password || '');
    const user = current.users.find(
      (item) => String(item.username || '').toLowerCase() === safeUsername && item.password === safePassword
    );
    if (!user) {
      return {
        ok: false,
        message: 'Invalid credentials.'
      };
    }

    dispatch({
      type: 'SET_SESSION',
      payload: {
        loggedIn: true,
        userId: user.id,
        role: user.role
      }
    });
    pushNotification(`Signed in as ${user.name}`, 'success');
    return { ok: true };
  }, [pushNotification]);

  const logout = useCallback(() => {
    dispatch({
      type: 'SET_SESSION',
      payload: {
        loggedIn: false,
        userId: '',
        role: ''
      }
    });
    pushNotification('You have been signed out.', 'info');
  }, [pushNotification]);

  const toggleTheme = useCallback(() => {
    dispatch({
      type: 'SET_THEME',
      payload: stateRef.current.theme === 'dark' ? 'light' : 'dark'
    });
  }, []);

  const setTaskStatus = useCallback((taskId, nextStatus, source = 'button') => {
    const current = stateRef.current;
    const task = current.tasks.find((item) => item.id === taskId);
    if (!task) {
      return { ok: false, message: 'Task not found.' };
    }

    const isManager = current.session.role === 'Manager';
    const isAssignedEmployee =
      current.session.role === 'Employee' && current.session.userId === task.assignedTo;
    if (!isManager && !isAssignedEmployee) {
      return { ok: false, message: 'Not allowed for this task.' };
    }

    if (!isManager) {
      const transitions = {
        Pending: ['In Progress'],
        'In Progress': ['Completed'],
        Completed: ['In Progress']
      };
      const allowed = transitions[task.status] || [];
      if (!allowed.includes(nextStatus)) {
        return { ok: false, message: `Invalid transition from ${task.status}.` };
      }
    }

    if (task.status === nextStatus) {
      return { ok: false, message: `Task is already ${nextStatus}.` };
    }

    if (nextStatus === 'Completed') {
      const blocker = getCompletionBlocker(task, current.tasks);
      if (blocker) {
        pushNotification(blocker, 'warning');
        return { ok: false, message: blocker };
      }
    }

    const actorId = current.session.userId || 'system';
    dispatch({
      type: 'UPDATE_TASKS',
      updater: (tasks) =>
        tasks.map((item) => {
          if (item.id !== taskId) {
            return item;
          }
          const changed = pushHistory(
            {
              ...item,
              status: nextStatus,
              reopenCount:
                item.status === 'Completed' && nextStatus === 'In Progress'
                  ? (item.reopenCount || 0) + 1
                  : item.reopenCount || 0,
              updatedAt: nowIso()
            },
            {
              type: 'status-change',
              actorId,
              message: `Status changed from ${item.status} to ${nextStatus}.`,
              meta: {
                fromStatus: item.status,
                toStatus: nextStatus,
                source
              }
            }
          );
          return changed;
        })
    });
    dispatch({
      type: 'PUSH_UNDO',
      payload: {
        type: 'task-status',
        taskId,
        previousStatus: task.status,
        nextStatus
      }
    });
    pushUndoToast(`Moved "${task.title}" to ${nextStatus}`);
    pushNotification(`"${task.title}" is now ${nextStatus}.`, nextStatus === 'Completed' ? 'success' : 'info');
    return { ok: true, message: `Moved to ${nextStatus}` };
  }, [pushNotification, pushUndoToast]);

  const reopenTaskForEmployee = useCallback((taskId) => {
    return setTaskStatus(taskId, 'In Progress', 'continue-work');
  }, [setTaskStatus]);

  const addTaskComment = useCallback(({ taskId, text }) => {
    const message = String(text || '').trim();
    if (!message) {
      return { ok: false, message: 'Comment cannot be empty.' };
    }

    const current = stateRef.current;
    const task = current.tasks.find((item) => item.id === taskId);
    if (!task) {
      return { ok: false, message: 'Task not found.' };
    }

    const isManager = current.session.role === 'Manager';
    const isAssignedEmployee =
      current.session.role === 'Employee' && current.session.userId === task.assignedTo;
    if (!isManager && !isAssignedEmployee) {
      return { ok: false, message: 'Not allowed for this task.' };
    }

    const actorId = current.session.userId || 'system';
    dispatch({
      type: 'UPDATE_TASKS',
      updater: (tasks) =>
        tasks.map((item) => {
          if (item.id !== taskId) {
            return item;
          }
          const withComment = {
            ...item,
            comments: [
              {
                id: createId('comment'),
                text: message,
                authorId: actorId,
                createdAt: nowIso()
              },
              ...(item.comments || [])
            ],
            updatedAt: nowIso()
          };
          return pushHistory(withComment, {
            type: 'comment',
            actorId,
            message: 'Comment added.',
            meta: {}
          });
        })
    });
    return { ok: true };
  }, []);

  const toggleSubtask = useCallback(({ taskId, subtaskId }) => {
    const current = stateRef.current;
    const task = current.tasks.find((item) => item.id === taskId);
    if (!task) {
      return { ok: false, message: 'Task not found.' };
    }

    const isManager = current.session.role === 'Manager';
    const isAssignedEmployee =
      current.session.role === 'Employee' && current.session.userId === task.assignedTo;
    if (!isManager && !isAssignedEmployee) {
      return { ok: false, message: 'Not allowed for this task.' };
    }

    const actorId = current.session.userId || 'system';
    dispatch({
      type: 'UPDATE_TASKS',
      updater: (tasks) =>
        tasks.map((item) => {
          if (item.id !== taskId) {
            return item;
          }
          const nextSubtasks = (item.subtasks || []).map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
          );
          return pushHistory(
            {
              ...item,
              subtasks: nextSubtasks,
              updatedAt: nowIso()
            },
            {
              type: 'subtask',
              actorId,
              message: 'Checklist updated.',
              meta: {
                subtaskId
              }
            }
          );
        })
    });
    return { ok: true };
  }, []);

  const addSubtask = useCallback(({ taskId, text }) => {
    const safeText = String(text || '').trim();
    if (!safeText) {
      return { ok: false, message: 'Subtask text is required.' };
    }

    const current = stateRef.current;
    const task = current.tasks.find((item) => item.id === taskId);
    if (!task) {
      return { ok: false, message: 'Task not found.' };
    }

    const isManager = current.session.role === 'Manager';
    const isAssignedEmployee =
      current.session.role === 'Employee' && current.session.userId === task.assignedTo;
    if (!isManager && !isAssignedEmployee) {
      return { ok: false, message: 'Not allowed for this task.' };
    }

    const actorId = current.session.userId || 'system';
    dispatch({
      type: 'UPDATE_TASKS',
      updater: (tasks) =>
        tasks.map((item) => {
          if (item.id !== taskId) {
            return item;
          }
          return pushHistory(
            {
              ...item,
              subtasks: [
                ...(item.subtasks || []),
                {
                  id: createId('subtask'),
                  text: safeText,
                  completed: false
                }
              ],
              updatedAt: nowIso()
            },
            {
              type: 'subtask',
              actorId,
              message: 'Checklist item added.',
              meta: {}
            }
          );
        })
    });
    return { ok: true };
  }, []);

  const createTask = useCallback(async (payload) => {
    requireManager();
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await delay(900);
      if (Math.random() < 0.2) {
        throw new Error('Simulated network error while creating task.');
      }

      const current = stateRef.current;
      const actorId = current.session.userId || 'system';
      let base = sanitizeTask({
        ...payload,
        id: createId('task'),
        labels: normalizeLabels(payload.labels),
        dependencies: normalizeDependencies(payload.dependencies),
        subtasks: normalizeSubtasks(payload.subtasks),
        comments: [],
        history: [],
        reopenCount: 0,
        createdAt: nowIso(),
        updatedAt: nowIso()
      });

      base.dependencies = base.dependencies.filter((dependencyId) =>
        current.tasks.some((task) => task.id === dependencyId)
      );
      base = pushHistory(base, {
        type: 'created',
        actorId,
        message: 'Task created.',
        meta: {}
      });
      base = pushHistory(base, {
        type: 'assigned',
        actorId,
        message: `Assigned to ${current.users.find((user) => user.id === base.assignedTo)?.name || 'Employee'}.`,
        meta: {
          assignedTo: base.assignedTo
        }
      });

      dispatch({
        type: 'UPDATE_TASKS',
        updater: (tasks) => [base, ...tasks]
      });
      dispatch({
        type: 'PUSH_UNDO',
        payload: {
          type: 'task-create',
          taskId: base.id
        }
      });
      pushUndoToast(`Created "${base.title}"`);
      pushNotification(`Task "${base.title}" assigned.`, 'success');
      return base;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      pushNotification(error.message || 'Task creation failed.', 'error');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [pushNotification, pushUndoToast, requireManager]);

  const updateTask = useCallback(async (taskId, payload) => {
    requireManager();
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await delay(850);
      if (Math.random() < 0.2) {
        throw new Error('Simulated network error while updating task.');
      }

      const current = stateRef.current;
      const existing = current.tasks.find((task) => task.id === taskId);
      if (!existing) {
        throw new Error('Task not found.');
      }

      const actorId = current.session.userId || 'system';
      const merged = sanitizeTask({
        ...existing,
        ...payload,
        id: existing.id,
        labels: normalizeLabels(payload.labels ?? existing.labels),
        dependencies: normalizeDependencies(payload.dependencies ?? existing.dependencies),
        subtasks: normalizeSubtasks(payload.subtasks ?? existing.subtasks),
        comments: existing.comments,
        history: existing.history,
        reopenCount: existing.reopenCount,
        createdAt: existing.createdAt,
        updatedAt: nowIso()
      });
      merged.dependencies = merged.dependencies
        .filter((dependencyId) => dependencyId !== existing.id)
        .filter((dependencyId) => current.tasks.some((task) => task.id === dependencyId));

      if (merged.status === 'Completed') {
        const blocker = getCompletionBlocker(merged, current.tasks);
        if (blocker) {
          throw new Error(blocker);
        }
      }

      let resultTask = merged;
      if (existing.assignedTo !== merged.assignedTo) {
        resultTask = pushHistory(resultTask, {
          type: 'assigned',
          actorId,
          message: `Reassigned to ${current.users.find((user) => user.id === merged.assignedTo)?.name || 'Employee'}.`,
          meta: {
            from: existing.assignedTo,
            to: merged.assignedTo
          }
        });
      }
      if (existing.status !== merged.status) {
        resultTask = pushHistory(resultTask, {
          type: 'status-change',
          actorId,
          message: `Status changed from ${existing.status} to ${merged.status}.`,
          meta: {
            fromStatus: existing.status,
            toStatus: merged.status
          }
        });
      }
      resultTask = pushHistory(resultTask, {
        type: 'edited',
        actorId,
        message: 'Task details updated.',
        meta: {}
      });

      dispatch({
        type: 'UPDATE_TASKS',
        updater: (tasks) => tasks.map((task) => (task.id === taskId ? resultTask : task))
      });
      dispatch({
        type: 'PUSH_UNDO',
        payload: {
          type: 'task-update',
          task: existing
        }
      });
      pushUndoToast(`Updated "${resultTask.title}"`);
      pushNotification(`Task "${resultTask.title}" updated.`, 'info');
      return resultTask;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      pushNotification(error.message || 'Task update failed.', 'error');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [pushNotification, pushUndoToast, requireManager]);

  const deleteTask = useCallback((taskId) => {
    requireManager();
    const current = stateRef.current;
    const task = current.tasks.find((item) => item.id === taskId);
    if (!task) {
      return false;
    }

    dispatch({
      type: 'UPDATE_TASKS',
      updater: (tasks) =>
        tasks
          .filter((item) => item.id !== taskId)
          .map((item) => ({
            ...item,
            dependencies: (item.dependencies || []).filter((dependencyId) => dependencyId !== taskId)
          }))
    });
    dispatch({
      type: 'PUSH_UNDO',
      payload: {
        type: 'task-delete',
        task
      }
    });
    pushUndoToast(`Deleted "${task.title}"`);
    pushNotification(`Task "${task.title}" deleted.`, 'warning');
    return true;
  }, [pushNotification, pushUndoToast, requireManager]);

  const addEmployee = useCallback(({ name, username, password }) => {
    requireManager();
    const safeName = String(name || '').trim();
    const safeUsername = String(username || '').trim().toLowerCase();
    const safePassword = String(password || '').trim();
    if (!safeName || !safeUsername || !safePassword) {
      throw new Error('Employee name, username, and password are required.');
    }

    const current = stateRef.current;
    const exists = current.users.some(
      (item) => String(item.username || '').trim().toLowerCase() === safeUsername
    );
    if (exists) {
      throw new Error('Username already exists.');
    }

    const employee = {
      id: createId('emp'),
      name: safeName,
      role: 'Employee',
      username: safeUsername,
      password: safePassword,
      githubUsername: '',
      avatarDataUrl: ''
    };
    dispatch({
      type: 'UPDATE_USERS',
      updater: (users) => [...users, employee]
    });
    pushNotification(`Employee "${employee.name}" added.`, 'success');
    return employee;
  }, [pushNotification, requireManager]);

  const addCalendarEvent = useCallback(({ title, date, description, recurrence, recurrenceUntil }) => {
    const current = stateRef.current;
    if (!current.session.loggedIn) {
      throw new Error('Sign in to add event.');
    }
    const safeTitle = String(title || '').trim();
    const safeDate = String(date || '').slice(0, 10);
    if (!safeTitle || !safeDate) {
      throw new Error('Event title and date are required.');
    }

    const recurrenceValue = ['none', 'daily', 'weekly', 'monthly'].includes(recurrence)
      ? recurrence
      : 'none';
    const safeUntil = recurrenceValue === 'none' ? '' : String(recurrenceUntil || '').slice(0, 10);

    dispatch({
      type: 'UPDATE_CALENDAR_EVENTS',
      updater: (events) =>
        [
          {
            id: createId('event'),
            title: safeTitle,
            date: safeDate,
            description: String(description || '').trim(),
            recurrence: recurrenceValue,
            recurrenceUntil: safeUntil,
            createdBy: current.session.userId,
            createdAt: nowIso(),
            autoGenerated: false
          },
          ...events
        ].sort((a, b) => String(a.date).localeCompare(String(b.date)))
    });
    pushNotification(`Event "${safeTitle}" scheduled.`, 'success');
  }, [pushNotification]);

  const deleteCalendarEvent = useCallback((eventId) => {
    const current = stateRef.current;
    const event = current.calendarEvents.find((item) => item.id === eventId);
    if (!event) {
      return false;
    }

    const isManager = current.session.role === 'Manager';
    const canDelete = isManager || event.createdBy === current.session.userId;
    if (!canDelete) {
      return false;
    }

    dispatch({
      type: 'UPDATE_CALENDAR_EVENTS',
      updater: (events) => events.filter((item) => item.id !== eventId)
    });
    pushNotification(`Event "${event.title}" removed.`, 'info');
    return true;
  }, [pushNotification]);

  const updateUserProfile = useCallback(({ userId, githubUsername, avatarDataUrl }) => {
    const current = stateRef.current;
    if (current.session.userId !== userId && current.session.role !== 'Manager') {
      throw new Error('Not allowed to edit this profile.');
    }

    dispatch({
      type: 'UPDATE_USERS',
      updater: (users) =>
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                githubUsername: String(githubUsername || '').trim(),
                avatarDataUrl: String(avatarDataUrl || '')
              }
            : user
        )
    });
    pushNotification('Profile updated.', 'success');
  }, [pushNotification]);

  const exportBackupData = useCallback(() => {
    return {
      version: 1,
      exportedAt: nowIso(),
      users: stateRef.current.users,
      tasks: stateRef.current.tasks,
      calendarEvents: stateRef.current.calendarEvents,
      theme: stateRef.current.theme
    };
  }, []);

  const importBackupData = useCallback((payload) => {
    requireManager();
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid backup payload.');
    }
    if (!Array.isArray(payload.users) || !Array.isArray(payload.tasks)) {
      throw new Error('Backup is missing users or tasks.');
    }

    const nextUsers = payload.users.map((user) => ({
      ...user,
      githubUsername: user.githubUsername || '',
      avatarDataUrl: user.avatarDataUrl || ''
    }));
    if (!nextUsers.some((user) => user.role === 'Manager')) {
      throw new Error('Backup must include at least one manager.');
    }

    const validUserIds = new Set(nextUsers.map((user) => user.id));
    const nextTasks = payload.tasks.map((task) => sanitizeTask(task)).map((task) => ({
      ...task,
      assignedTo: validUserIds.has(task.assignedTo) ? task.assignedTo : '',
      dependencies: (task.dependencies || []).filter((dependencyId) =>
        payload.tasks.some((sourceTask) => sourceTask.id === dependencyId)
      )
    }));
    const nextEvents = Array.isArray(payload.calendarEvents) ? payload.calendarEvents : [];

    dispatch({ type: 'UPDATE_USERS', updater: () => nextUsers });
    dispatch({ type: 'SET_TASKS', payload: nextTasks });
    dispatch({ type: 'SET_CALENDAR_EVENTS', payload: nextEvents });
    dispatch({ type: 'PUSH_UNDO', payload: { type: 'import-snapshot' } });
    pushNotification('Backup imported successfully.', 'success');
  }, [pushNotification, requireManager]);

  const undoLastAction = useCallback(() => {
    const current = stateRef.current;
    if (current.undoStack.length === 0) {
      return false;
    }

    const latest = current.undoStack[current.undoStack.length - 1];

    if (latest.type === 'task-status') {
      const actorId = current.session.userId || 'system';
      dispatch({
        type: 'UPDATE_TASKS',
        updater: (tasks) =>
          tasks.map((task) => {
            if (task.id !== latest.taskId) {
              return task;
            }
            return pushHistory(
              {
                ...task,
                status: latest.previousStatus,
                updatedAt: nowIso()
              },
              {
                type: 'undo',
                actorId,
                message: `Undo: status restored to ${latest.previousStatus}.`,
                meta: {}
              }
            );
          })
      });
      pushNotification('Status change reverted.', 'info');
    } else if (latest.type === 'task-delete') {
      dispatch({
        type: 'UPDATE_TASKS',
        updater: (tasks) =>
          tasks.some((task) => task.id === latest.task.id) ? tasks : [latest.task, ...tasks]
      });
      pushNotification('Deleted task restored.', 'info');
    } else if (latest.type === 'task-update') {
      dispatch({
        type: 'UPDATE_TASKS',
        updater: (tasks) => tasks.map((task) => (task.id === latest.task.id ? latest.task : task))
      });
      pushNotification('Task update reverted.', 'info');
    } else if (latest.type === 'task-create') {
      dispatch({
        type: 'UPDATE_TASKS',
        updater: (tasks) => tasks.filter((task) => task.id !== latest.taskId)
      });
      pushNotification('Created task removed.', 'info');
    }

    dispatch({ type: 'POP_UNDO' });
    dispatch({ type: 'CLEAR_TOAST' });
    return true;
  }, [pushNotification]);

  const markNotificationRead = useCallback((notificationId) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }, []);

  const removeNotification = useCallback((notificationId) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  }, []);

  const dismissToast = useCallback(() => {
    dispatch({ type: 'CLEAR_TOAST' });
  }, []);

  const getTaskCompletionBlocker = useCallback((taskId) => {
    const current = stateRef.current;
    const task = current.tasks.find((item) => item.id === taskId);
    if (!task) {
      return '';
    }
    return getCompletionBlocker(task, current.tasks);
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      initialize,
      login,
      logout,
      toggleTheme,
      createTask,
      updateTask,
      deleteTask,
      addEmployee,
      setTaskStatus,
      reopenTaskForEmployee,
      addTaskComment,
      toggleSubtask,
      addSubtask,
      addCalendarEvent,
      deleteCalendarEvent,
      updateUserProfile,
      exportBackupData,
      importBackupData,
      undoLastAction,
      markNotificationRead,
      markAllNotificationsRead,
      removeNotification,
      dismissToast,
      getTaskCompletionBlocker
    }),
    [
      addCalendarEvent,
      addEmployee,
      addSubtask,
      addTaskComment,
      createTask,
      deleteCalendarEvent,
      deleteTask,
      dismissToast,
      exportBackupData,
      getTaskCompletionBlocker,
      importBackupData,
      initialize,
      login,
      logout,
      markAllNotificationsRead,
      markNotificationRead,
      removeNotification,
      reopenTaskForEmployee,
      setTaskStatus,
      state,
      toggleSubtask,
      toggleTheme,
      undoLastAction,
      updateTask,
      updateUserProfile
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }
  return context;
}
