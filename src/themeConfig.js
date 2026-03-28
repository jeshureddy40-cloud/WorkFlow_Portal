// Light mode theme
export const lightTheme = {
  background: '#ffffff',
  text: '#333333',
  cardBg: '#f5f5f5',
  border: '#ddd',
  primary: '#667eea'
};

// Dark mode theme
export const darkTheme = {
  background: '#1a1a1a',
  text: '#e0e0e0',
  cardBg: '#2a2a2a',
  border: '#444',
  primary: '#7c8ff6'
};

// Toggle dark mode
export const toggleDarkMode = () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  localStorage.setItem('darkMode', !isDark);
  return !isDark;
};

// Check if dark mode is enabled
export const isDarkMode = () => {
  return localStorage.getItem('darkMode') === 'true';
};

// Get current theme
export const getTheme = () => {
  return isDarkMode() ? darkTheme : lightTheme;
};
