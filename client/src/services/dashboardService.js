/**
 * Dashboard Service - Optimized for Activity Heatmap
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Fetch activities with optional filters
 */
export async function fetchActivities(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate.toISOString());
    }
    if (filters.category) {
      queryParams.append('category', filters.category);
    }
    if (filters.domain) {
      queryParams.append('domain', filters.domain);
    }
    if (filters.minProductivity) {
      queryParams.append('minProductivity', filters.minProductivity);
    }

    const response = await fetch(`${API_BASE_URL}/activities?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}

/**
 * Fetch heatmap data (pre-aggregated from backend for better performance)
 */
export async function fetchHeatmapData(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/activities/heatmap?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    throw error;
  }
}

/**
 * Fetch analytics data
 */
export async function fetchAnalytics(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/analytics?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

/**
 * Batch fetch multiple data types
 */
export async function fetchDashboardData(filters = {}) {
  try {
    const [activities, analytics] = await Promise.all([
      fetchActivities(filters),
      fetchAnalytics(filters)
    ]);

    return {
      activities,
      analytics
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Get available categories
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get available domains
 */
export async function fetchDomains() {
  try {
    const response = await fetch(`${API_BASE_URL}/domains`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching domains:', error);
    return [];
  }
}

export default {
  fetchActivities,
  fetchHeatmapData,
  fetchAnalytics,
  fetchDashboardData,
  fetchCategories,
  fetchDomains
};
