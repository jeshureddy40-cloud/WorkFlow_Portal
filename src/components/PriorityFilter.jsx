import React from 'react';

const PriorityFilter = ({ selectedPriority, onFilter, priorities }) => {
  return (
    <div style={styles.container}>
      <label style={styles.label}>Filter by Priority:</label>
      <div style={styles.buttons}>
        <button onClick={() => onFilter(null)} style={styles.btn}>All</button>
        {priorities.map(p => (
          <button key={p} onClick={() => onFilter(p)} style={styles.btn}>{p}</button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { marginBottom: '20px' },
  label: { fontWeight: 'bold', marginBottom: '10px' },
  buttons: { display: 'flex', gap: '10px' },
  btn: { padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#667eea', color: '#fff' }
};

export default PriorityFilter;
