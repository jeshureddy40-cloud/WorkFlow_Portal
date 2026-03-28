// Keyboard shortcuts configuration
export const KEYBOARD_SHORTCUTS = {
  CREATE_TASK: 'Ctrl+N',
  TOGGLE_SEARCH: 'Ctrl+F',
  TOGGLE_GROUP: 'Ctrl+G',
  TOGGLE_DARK_MODE: 'Ctrl+D',
  DELETE_TASK: 'Delete',
  EXPORT_CSV: 'Ctrl+E',
  HELP: '?'
};

// Handle keyboard shortcuts
export const handleKeyPress = (key, callbacks) => {
  const keyMap = {
    'ctrl+n': callbacks.onCreate,
    'ctrl+f': callbacks.onSearch,
    'ctrl+g': callbacks.onToggleGroup,
    'ctrl+d': callbacks.onToggleDark,
    'Delete': callbacks.onDelete,
    'ctrl+e': callbacks.onExport,
    '?': callbacks.onHelp
  };
  
  const handler = keyMap[key.toLowerCase()];
  if (handler) handler();
};

// Setup global keyboard listeners
export const setupKeyboardListeners = (callbacks) => {
  const handleKeyDown = (e) => {
    const key = e.ctrlKey ? `ctrl+${e.key.toLowerCase()}` : e.key;
    handleKeyPress(key, callbacks);
  };
  
  window.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => window.removeEventListener('keydown', handleKeyDown);
};
