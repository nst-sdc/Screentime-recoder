export const getProductivityColor = (score) => {
  if (score >= 7) return 'productive-high';
  if (score >= 4) return 'productive-medium';
  return 'productive-low';
};

export const getProductivityBadge = (score) => {
  if (score >= 7) return '🟢';
  if (score >= 4) return '🟡';
  return '🔴';
};

export const getProductivityLabel = (score) => {
  if (score >= 7) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
};

export const calculateProductivityStats = (activities) => {
  if (!activities || activities.length === 0) {
    return {
      average: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    };
  }

  const total = activities.length;
  const high = activities.filter(a => (a.productivityScore || 0) >= 7).length;
  const medium = activities.filter(a => {
    const score = a.productivityScore || 0;
    return score >= 4 && score < 7;
  }).length;
  const low = activities.filter(a => (a.productivityScore || 0) < 4).length;
  
  const average = activities.reduce((sum, a) => sum + (a.productivityScore || 0), 0) / total;

  return {
    average: average.toFixed(1),
    high,
    medium,
    low,
    total,
    highPercent: ((high / total) * 100).toFixed(1),
    mediumPercent: ((medium / total) * 100).toFixed(1),
    lowPercent: ((low / total) * 100).toFixed(1)
  };
};
