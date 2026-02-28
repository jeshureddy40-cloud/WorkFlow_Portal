// Task data service with async simulation
import { WORKFLOW_STATES, PRIORITIES } from './workflowConfig.js';

// Mock initial tasks
const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Design system architecture',
    description: 'Establish scalable single-page architecture with modular components',
    status: WORKFLOW_STATES.COMPLETED,
    priority: PRIORITIES.HIGH,
    createdAt: new Date('2026-02-01'),
    dueDate: new Date('2026-02-10'),
    assignee: 'Alice Johnson'
  },
  {
    id: 2,
    title: 'Create reusable components',
    description: 'Design reusable task and workflow components with clear data contracts',
    status: WORKFLOW_STATES.IN_PROGRESS,
    priority: PRIORITIES.HIGH,
    createdAt: new Date('2026-02-05'),
    dueDate: new Date('2026-02-28'),
    assignee: 'Bob Smith'
  },
  {
    id: 3,
    title: 'Implement state management',
    description: 'Manage user interactions through controlled events and state updates',
    status: WORKFLOW_STATES.REVIEW,
    priority: PRIORITIES.HIGH,
    createdAt: new Date('2026-02-10'),
    dueDate: new Date('2026-02-25'),
    assignee: 'Carol Davis'
  },
  {
    id: 4,
    title: 'Add routing and navigation',
    description: 'Apply route-based workflow segmentation between workflow views',
    status: WORKFLOW_STATES.TODO,
    priority: PRIORITIES.MEDIUM,
    createdAt: new Date('2026-02-15'),
    dueDate: new Date('2026-03-05'),
    assignee: 'David Wilson'
  },
  {
    id: 5,
    title: 'Implement async operations',
    description: 'Integrate asynchronous task data with robust loading and error states',
    status: WORKFLOW_STATES.TODO,
    priority: PRIORITIES.MEDIUM,
    createdAt: new Date('2026-02-16'),
    dueDate: new Date('2026-03-10'),
    assignee: 'Emma Brown'
  },
  {
    id: 6,
    title: 'Optimize performance',
    description: 'Minimize re-renders using memoization and accessibility support',
    status: WORKFLOW_STATES.BACKLOG,
    priority: PRIORITIES.LOW,
    createdAt: new Date('2026-02-20'),
    dueDate: null,
    assignee: 'Frank Miller'
  }
];

// Simulate API delay
const DELAY = 800;

/**
 * Fetch all tasks asynchronously
 * @returns {Promise<Array>} Array of task objects
 */
export const fetchTasks = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...INITIAL_TASKS]);
    }, DELAY);
  });
};

/**
 * Fetch a single task by ID
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Task object
 */
export const fetchTaskById = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const task = INITIAL_TASKS.find(t => t.id === id);
      if (task) {
        resolve({ ...task });
      } else {
        reject(new Error(`Task with ID ${id} not found`));
      }
    }, DELAY);
  });
};

/**
 * Create a new task
 * @param {Object} taskData - Task data without ID
 * @returns {Promise<Object>} Created task with ID
 */
export const createTask = async (taskData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTask = {
        id: Math.max(...INITIAL_TASKS.map(t => t.id), 0) + 1,
        ...taskData,
        createdAt: new Date(),
        status: taskData.status || WORKFLOW_STATES.BACKLOG
      };
      INITIAL_TASKS.push(newTask);
      resolve({ ...newTask });
    }, DELAY);
  });
};

/**
 * Update an existing task
 * @param {number} id - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (id, updates) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const taskIndex = INITIAL_TASKS.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        INITIAL_TASKS[taskIndex] = {
          ...INITIAL_TASKS[taskIndex],
          ...updates
        };
        resolve({ ...INITIAL_TASKS[taskIndex] });
      } else {
        reject(new Error(`Task with ID ${id} not found`));
      }
    }, DELAY);
  });
};

/**
 * Delete a task
 * @param {number} id - Task ID
 * @returns {Promise<void>}
 */
export const deleteTask = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const taskIndex = INITIAL_TASKS.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        INITIAL_TASKS.splice(taskIndex, 1);
        resolve();
      } else {
        reject(new Error(`Task with ID ${id} not found`));
      }
    }, DELAY);
  });
};

/**
 * Fetch tasks filtered by status
 * @param {string} status - Workflow status
 * @returns {Promise<Array>} Filtered tasks
 */
export const fetchTasksByStatus = async (status) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = INITIAL_TASKS.filter(t => t.status === status);
      resolve([...filtered]);
    }, DELAY);
  });
};
