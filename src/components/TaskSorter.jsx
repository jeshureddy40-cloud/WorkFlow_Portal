import React from 'react';

const TaskSorter = ({ sortBy, onSort }) => {
  const sortOptions = [
    { value: 'name', label: '📝 Sort by Title' },
    { value: 'priority', label: '⭐ Sort by Priority' },
    { value: 'status', label: '📊 Sort by Status' },
    { value: 'dueDate', label: '📅 Sort by Due Date' },
    { value: 'assignee', label: '👤 Sort by Assignee' },
    { value: 'createdAt', label: '🕐 Sort by Created Date' }
  ];

  return (
    <div style={styles.container}>
      <label style={styles.label}>Sort Tasks:</label>
      <select 
        value={sortBy} 
        onChange={(e) => onSort(e.target.value)} 
        style={styles.select}
        aria-label="Sort tasks by different criteria"
      >
        <option value=''>Default Order</option>
        {sortOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    whiteSpace: 'nowrap'
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '2px solid #667eea',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default TaskSorter;
