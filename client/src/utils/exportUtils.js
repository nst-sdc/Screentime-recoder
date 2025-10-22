export const exportToCSV = (activities, filename = 'activities') => {
  const headers = ['Domain', 'Category', 'Duration (seconds)', 'Productivity Score', 'Session Count', 'Timestamp'];
  
  const rows = activities.map(activity => [
    activity.domain || '',
    activity.category || '',
    activity.duration || 0,
    activity.productivityScore || 0,
    activity.sessionCount || 1,
    activity.timestamp || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (activities, filename = 'activities') => {
  const jsonContent = JSON.stringify(activities, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
