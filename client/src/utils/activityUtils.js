export const filterActivities = (activities, filters) => {
  return activities.filter(activity => {
    // Category filter
    if (filters.category !== 'all' && activity.category !== filters.category) {
      return false;
    }

    // Productivity filter
    if (filters.productivity !== 'all') {
      const score = activity.productivityScore || 0;
      if (filters.productivity === 'high' && score < 7) return false;
      if (filters.productivity === 'medium' && (score < 4 || score >= 7)) return false;
      if (filters.productivity === 'low' && score >= 4) return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const domainMatch = activity.domain?.toLowerCase().includes(searchLower);
      const categoryMatch = activity.category?.toLowerCase().includes(searchLower);
      if (!domainMatch && !categoryMatch) return false;
    }

    return true;
  });
};

export const sortActivities = (activities, sortBy, sortOrder) => {
  const sorted = [...activities].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle undefined values
    if (aVal === undefined) aVal = 0;
    if (bVal === undefined) bVal = 0;

    // String comparison
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    // Numeric comparison
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return sorted;
};

export const groupActivities = (activities, groupBy) => {
  const groups = {};

  activities.forEach(activity => {
    let key;

    switch (groupBy) {
      case 'category':
        key = activity.category || 'Uncategorized';
        break;
      case 'domain':
        key = activity.domain || 'Unknown';
        break;
      case 'productivity':
        const score = activity.productivityScore || 0;
        if (score >= 7) key = 'high';
        else if (score >= 4) key = 'medium';
        else key = 'low';
        break;
      default:
        key = 'all';
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(activity);
  });

  return groups;
};
