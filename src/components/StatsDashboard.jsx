import React from 'react';

const StatsDashboard = ({ tasks }) => {
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const highPriority = tasks.filter(t => t.priority === 'High').length;
  const completionRate = Math.round((completed / Math.max(tasks.length, 1)) * 100);

  const stats = [
    { label: 'Total Tasks', value: tasks.length },
    { label: 'Completed', value: completed },
    { label: 'In Progress', value: inProgress },
    { label: 'High Priority', value: highPriority },
    { label: 'Completion Rate', value: `${completionRate}%` }
  ];

  return (
    <div style={styles.dashboard}>
      <h2 style={styles.title}>📊 Task Statistics</h2>
      <div style={styles.grid}>
        {stats.map((stat, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.number}>{stat.value}</div>
            <div style={styles.label}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  dashboard: { padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '10px', marginBottom: '20px' },
  title: { marginTop: 0, color: '#333', fontSize: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' },
  card: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  number: { fontSize: '28px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' },
  label: { fontSize: '12px', color: '#666' }
};

export default StatsDashboard;
