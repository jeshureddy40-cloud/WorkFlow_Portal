import React, { useState } from 'react';

const TaskSearch = ({ tasks, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term) ||
      task.assignee.toLowerCase().includes(term)
    );
    onSearch(filtered);
  };

  return (
    <div style={styles.container}>
      <input type="text" placeholder="🔍 Search tasks..." value={searchTerm} onChange={handleSearch} style={styles.input} />
    </div>
  );
};

const styles = { container: { marginBottom: '20px' }, input: { width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #667eea', borderRadius: '8px' } };

export default TaskSearch;
