/**
 * Optimized utilities for Activity Heatmap data transformation
 */

// Memoization cache for expensive calculations
const cache = new Map();

/**
 * Generate cache key from parameters
 */
function getCacheKey(data, filters) {
  return JSON.stringify({ dataHash: data.length, filters });
}

/**
 * Transform activity data into heatmap format with optimized performance
 * @param {Array} activities - Raw activity data
 * @param {Object} filters - Filter options
 * @returns {Array} Transformed heatmap data
 */
export function transformActivityData(activities, filters = {}) {
  const cacheKey = getCacheKey(activities, filters);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const { startDate, endDate, category, domain, minProductivity } = filters;
  
  // Filter activities efficiently
  const filtered = activities.filter(activity => {
    if (startDate && new Date(activity.timestamp) < new Date(startDate)) return false;
    if (endDate && new Date(activity.timestamp) > new Date(endDate)) return false;
    if (category && activity.category !== category) return false;
    if (domain && activity.domain !== domain) return false;
    if (minProductivity && activity.productivityScore < minProductivity) return false;
    return true;
  });

  // Use Map for O(1) lookups instead of array operations
  const heatmapMap = new Map();
  
  filtered.forEach(activity => {
    const date = new Date(activity.timestamp);
    const day = date.toISOString().split('T')[0];
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    
    if (!heatmapMap.has(key)) {
      heatmapMap.set(key, {
        day,
        hour,
        value: 0,
        count: 0,
        activities: []
      });
    }
    
    const cell = heatmapMap.get(key);
    cell.value += activity.duration || 1;
    cell.count += 1;
    cell.activities.push(activity);
  });

  // Convert Map to Array
  const result = Array.from(heatmapMap.values());
  
  // Cache the result
  cache.set(cacheKey, result);
  
  // Limit cache size
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  return result;
}

/**
 * Calculate advanced analytics from heatmap data
 */
export function calculateAnalytics(heatmapData) {
  if (!heatmapData || heatmapData.length === 0) {
    return {
      peakHour: null,
      mostActiveDay: null,
      averageDaily: 0,
      consistency: 0,
      productivityTrend: 0,
      focusIntervals: [],
      categoryBreakdown: {}
    };
  }

  // Peak hour calculation
  const hourMap = new Map();
  heatmapData.forEach(cell => {
    const current = hourMap.get(cell.hour) || 0;
    hourMap.set(cell.hour, current + cell.value);
  });
  
  let peakHour = 0;
  let maxValue = 0;
  hourMap.forEach((value, hour) => {
    if (value > maxValue) {
      maxValue = value;
      peakHour = hour;
    }
  });

  // Most active day
  const dayMap = new Map();
  heatmapData.forEach(cell => {
    const current = dayMap.get(cell.day) || 0;
    dayMap.set(cell.day, current + cell.value);
  });
  
  let mostActiveDay = null;
  let maxDayValue = 0;
  dayMap.forEach((value, day) => {
    if (value > maxDayValue) {
      maxDayValue = value;
      mostActiveDay = day;
    }
  });

  // Average daily activity
  const averageDaily = maxDayValue > 0 ? maxDayValue / dayMap.size : 0;

  // Consistency score (0-100)
  const values = Array.from(dayMap.values());
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const consistency = mean > 0 ? Math.max(0, 100 - (stdDev / mean * 100)) : 0;

  // Focus intervals (consecutive high-activity hours)
  const focusIntervals = findFocusIntervals(heatmapData);

  // Category breakdown
  const categoryBreakdown = {};
  heatmapData.forEach(cell => {
    cell.activities.forEach(activity => {
      const cat = activity.category || 'Uncategorized';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (activity.duration || 1);
    });
  });

  return {
    peakHour,
    mostActiveDay,
    averageDaily: Math.round(averageDaily),
    consistency: Math.round(consistency),
    focusIntervals,
    categoryBreakdown
  };
}

/**
 * Find focus intervals (consecutive high-activity periods)
 */
function findFocusIntervals(heatmapData) {
  const intervals = [];
  const threshold = calculateThreshold(heatmapData);
  
  // Group by day
  const dayGroups = new Map();
  heatmapData.forEach(cell => {
    if (!dayGroups.has(cell.day)) {
      dayGroups.set(cell.day, []);
    }
    dayGroups.get(cell.day).push(cell);
  });

  dayGroups.forEach((cells, day) => {
    cells.sort((a, b) => a.hour - b.hour);
    
    let intervalStart = null;
    let intervalEnd = null;
    
    cells.forEach(cell => {
      if (cell.value >= threshold) {
        if (intervalStart === null) {
          intervalStart = cell.hour;
        }
        intervalEnd = cell.hour;
      } else if (intervalStart !== null) {
        intervals.push({
          day,
          start: intervalStart,
          end: intervalEnd,
          duration: intervalEnd - intervalStart + 1
        });
        intervalStart = null;
        intervalEnd = null;
      }
    });
    
    if (intervalStart !== null) {
      intervals.push({
        day,
        start: intervalStart,
        end: intervalEnd,
        duration: intervalEnd - intervalStart + 1
      });
    }
  });

  return intervals.sort((a, b) => b.duration - a.duration).slice(0, 5);
}

/**
 * Calculate threshold for focus intervals
 */
function calculateThreshold(heatmapData) {
  const values = heatmapData.map(cell => cell.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return mean * 1.5; // 150% of mean
}

/**
 * Get time range presets
 */
export function getTimeRangePresets() {
  const now = new Date();
  
  return {
    today: {
      startDate: new Date(now.setHours(0, 0, 0, 0)),
      endDate: new Date(now.setHours(23, 59, 59, 999))
    },
    week: {
      startDate: new Date(now.setDate(now.getDate() - 7)),
      endDate: new Date()
    },
    month: {
      startDate: new Date(now.setMonth(now.getMonth() - 1)),
      endDate: new Date()
    },
    quarter: {
      startDate: new Date(now.setMonth(now.getMonth() - 3)),
      endDate: new Date()
    }
  };
}

/**
 * Export data for external use
 */
export function exportHeatmapData(heatmapData, format = 'csv') {
  if (format === 'csv') {
    const headers = ['Day', 'Hour', 'Activity Count', 'Total Duration'];
    const rows = heatmapData.map(cell => 
      [cell.day, cell.hour, cell.count, cell.value].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
  
  if (format === 'json') {
    return JSON.stringify(heatmapData, null, 2);
  }
  
  return heatmapData;
}
