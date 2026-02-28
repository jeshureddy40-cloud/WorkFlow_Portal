// Workflow state definitions and transitions
export const WORKFLOW_STATES = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

export const STATE_COLORS = {
  [WORKFLOW_STATES.BACKLOG]: '#808080',
  [WORKFLOW_STATES.TODO]: '#ff9800',
  [WORKFLOW_STATES.IN_PROGRESS]: '#2196f3',
  [WORKFLOW_STATES.REVIEW]: '#9c27b0',
  [WORKFLOW_STATES.COMPLETED]: '#4caf50',
  [WORKFLOW_STATES.ARCHIVED]: '#607d8b'
};

export const STATE_DISPLAY_NAMES = {
  [WORKFLOW_STATES.BACKLOG]: 'Backlog',
  [WORKFLOW_STATES.TODO]: 'To Do',
  [WORKFLOW_STATES.IN_PROGRESS]: 'In Progress',
  [WORKFLOW_STATES.REVIEW]: 'Review',
  [WORKFLOW_STATES.COMPLETED]: 'Completed',
  [WORKFLOW_STATES.ARCHIVED]: 'Archived'
};

// Valid state transitions
export const STATE_TRANSITIONS = {
  [WORKFLOW_STATES.BACKLOG]: [WORKFLOW_STATES.TODO, WORKFLOW_STATES.ARCHIVED],
  [WORKFLOW_STATES.TODO]: [WORKFLOW_STATES.IN_PROGRESS, WORKFLOW_STATES.BACKLOG, WORKFLOW_STATES.ARCHIVED],
  [WORKFLOW_STATES.IN_PROGRESS]: [WORKFLOW_STATES.REVIEW, WORKFLOW_STATES.TODO, WORKFLOW_STATES.ARCHIVED],
  [WORKFLOW_STATES.REVIEW]: [WORKFLOW_STATES.COMPLETED, WORKFLOW_STATES.IN_PROGRESS, WORKFLOW_STATES.ARCHIVED],
  [WORKFLOW_STATES.COMPLETED]: [WORKFLOW_STATES.ARCHIVED],
  [WORKFLOW_STATES.ARCHIVED]: []
};

// Priority levels
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const PRIORITY_DISPLAY_NAMES = {
  [PRIORITIES.LOW]: 'Low',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.HIGH]: 'High'
};

export const PRIORITY_COLORS = {
  [PRIORITIES.LOW]: '#4caf50',
  [PRIORITIES.MEDIUM]: '#ff9800',
  [PRIORITIES.HIGH]: '#f44336'
};

// Basic authentication rules for the portal demo
export const LOGIN_CREDENTIAL_RULES = {
  minPasswordLength: 8,
  usernamePattern: /^[a-zA-Z][a-zA-Z0-9._-]{2,19}$/
};

export const DEMO_USERS = [
  {
    username: 'admin',
    password: 'Admin@123',
    displayName: 'Portal Admin',
    role: 'manager'
  },
  {
    username: 'manager',
    password: 'Manager@123',
    displayName: 'Workflow Manager',
    role: 'manager'
  },
  {
    username: 'bob',
    password: 'Employee@123',
    displayName: 'Bob Smith',
    role: 'employee'
  },
  {
    username: 'emma',
    password: 'Employee@123',
    displayName: 'Emma Brown',
    role: 'employee'
  },
  {
    username: 'carol',
    password: 'Employee@123',
    displayName: 'Carol Davis',
    role: 'employee'
  }
];
