import { DEMO_USERS } from './workflowConfig.js';

const STORAGE_KEY = 'portalUsers';

const normalizeUsername = (username) => username.trim().toLowerCase();

const readStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const getAllUsers = () => {
  return [...DEMO_USERS, ...readStoredUsers()];
};

export const isUsernameTaken = (username) => {
  const target = normalizeUsername(username);
  return getAllUsers().some((user) => normalizeUsername(user.username) === target);
};

export const registerUser = ({ username, password, displayName }) => {
  if (isUsernameTaken(username)) {
    throw new Error('Username already exists.');
  }

  const storedUsers = readStoredUsers();
  const createdUser = {
    username: username.trim(),
    password,
    displayName: displayName.trim() || username.trim(),
    role: 'employee'
  };
  storedUsers.push(createdUser);
  writeStoredUsers(storedUsers);

  return createdUser;
};

export const authenticateUser = ({ username, password }) => {
  const target = normalizeUsername(username);
  const user = getAllUsers().find((item) => normalizeUsername(item.username) === target);

  if (!user || user.password !== password) {
    throw new Error('Invalid credentials.');
  }

  return {
    username: user.username,
    displayName: user.displayName || user.username,
    role: user.role || 'employee'
  };
};

export const getUsersByRole = (role) => {
  return getAllUsers().filter((user) => (user.role || 'employee') === role);
};
