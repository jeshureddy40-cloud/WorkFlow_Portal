// Export tasks to CSV format
export const exportTasksToCSV = (tasks) => {
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Due Date'];
  const csvRows = [
    headers.join(','),
    ...tasks.map(t => 
      [t.id, t.title, t.status, t.priority, t.assignee, t.dueDate || 'N/A'].join(',')
    )
  ];
  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, `tasks_${new Date().toISOString()}.csv`, 'text/csv');
};

// Export tasks to JSON format
export const exportTasksToJSON = (tasks) => {
  const jsonContent = JSON.stringify(tasks, null, 2);
  downloadFile(jsonContent, `tasks_${new Date().toISOString()}.json`, 'application/json');
};

// Helper to download file
const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
