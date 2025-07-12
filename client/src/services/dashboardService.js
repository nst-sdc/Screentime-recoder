import axios from 'axios';

class DashboardService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    this.api = axios.create({
      baseURL: this.baseURL,
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get user's activity summary
  async getActivitySummary(timeRange = 'today') {
    try {
      const response = await this.api.get(`/activity/summary`, {
        params: { timeRange }
      });
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : response.data.data || [],
        timeRange,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'Failed to fetch activity summary',
        timeRange,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get daily usage pattern
  async getDailyUsage(date = new Date().toISOString().split('T')[0]) {
    try {
      const response = await this.api.get(`/activity/daily-usage`, {
        params: { date }
      });
      return {
        success: true,
        data: response.data.data || [],
        date,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching daily usage:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'Failed to fetch daily usage',
        date,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get top websites/applications
  async getTopSites(limit = 10) {
    try {
      const response = await this.api.get(`/activity/top-sites`, {
        params: { limit }
      });
      return {
        success: true,
        data: response.data.data || [],
        limit,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching top sites:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'Failed to fetch top sites',
        limit,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get productivity metrics
  async getProductivityMetrics() {
    try {
      const response = await this.api.get('/activity/productivity');
      return response.data;
    } catch (error) {
      console.error('Error fetching productivity metrics:', error);
      throw error;
    }
  }

  // Seed sample data for testing (development only)
  async seedSampleData() {
    try {
      const response = await this.api.post('/activity/seed');
      return response.data;
    } catch (error) {
      console.error('Error seeding sample data:', error);
      throw error;
    }
  }

  // Transform backend data to chart-friendly format
  transformActivityData(backendData) {
    if (!backendData || !Array.isArray(backendData)) {
      return [];
    }

    return backendData.map(item => ({
      category: item.category || item._id || 'Unknown',
      minutes: Math.round((item.totalDuration || item.duration || 0) / 60000), // Convert ms to minutes
      color: this.getCategoryColor(item.category || item._id)
    }));
  }

  transformDailyUsage(backendData) {
    if (!backendData || !Array.isArray(backendData)) {
      return [];
    }

    return backendData.map(item => ({
      time: item.time,
      usage: item.usage
    }));
  }

  transformTopSites(backendData) {
    if (!backendData || !Array.isArray(backendData)) {
      return [];
    }

    const totalTime = backendData.reduce((sum, item) => sum + (item.duration || 0), 0);

    return backendData.map(item => ({
      domain: item.domain || item._id || 'Unknown',
      duration: this.formatDuration(item.duration || 0),
      percentage: totalTime > 0 ? Math.round((item.duration / totalTime) * 100) : 0
    }));
  }

  // Get category color
  getCategoryColor(category) {
    const colorMap = {
      'Productivity': '#10B981',
      'Communication': '#3B82F6',
      'Entertainment': '#8B5CF6',
      'Social Media': '#F59E0B',
      'News': '#06B6D4',
      'Shopping': '#EC4899',
      'Education': '#84CC16',
      'Others': '#EF4444'
    };

    return colorMap[category] || '#9CA3AF';
  }

  // Format duration
  formatDuration(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Calculate productivity score
  calculateProductivityScore(activityData) {
    if (!activityData || activityData.length === 0) return 0;

    const productiveCategories = ['Productivity', 'Education', 'Work'];
    const totalTime = activityData.reduce((sum, item) => sum + item.minutes, 0);
    const productiveTime = activityData
      .filter(item => productiveCategories.includes(item.category))
      .reduce((sum, item) => sum + item.minutes, 0);

    return Math.round((productiveTime / totalTime) * 100);
  }

  // Get category analytics
  async getCategoryAnalytics(startDate, endDate, period = 'day') {
    try {
      const response = await this.api.get('/activity/analytics/categories', {
        params: { startDate, endDate, period }
      });
      return {
        success: true,
        data: response.data.data || response.data,
        params: { startDate, endDate, period },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      return {
        success: false,
        data: { categoryBreakdown: [], overview: null },
        error: error.response?.data?.message || error.message || 'Failed to fetch category analytics',
        params: { startDate, endDate, period },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get productivity insights
  async getProductivityInsights(days = 7) {
    try {
      const response = await this.api.get('/activity/analytics/productivity', {
        params: { days }
      });
      return {
        success: true,
        data: response.data.data || response.data,
        days,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching productivity insights:', error);
      return {
        success: false,
        data: { dailyTrends: [], overview: null },
        error: error.response?.data?.message || error.message || 'Failed to fetch productivity insights',
        days,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get all categories
  async getCategories() {
    try {
      const response = await this.api.get('/activity/categories');
      return {
        success: true,
        data: response.data.data || response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'Failed to fetch categories',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Trigger recategorization of activities
  async recategorizeActivities(days = 1) {
    try {
      const response = await this.api.post('/activity/recategorize', {}, {
        params: { days }
      });
      return {
        success: true,
        data: response.data,
        days,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error recategorizing activities:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to recategorize activities',
        days,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Validate and sanitize activity data
  validateActivityData(data) {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.filter(item => {
      // Basic validation
      return item && 
             (item._id || item.domain) && 
             typeof (item.totalDuration || item.duration) === 'number';
    }).map(item => {
      // Ensure productivity is a valid number
      const rawProductivity = item.avgProductivityScore || item.productivity || 5;
      const productivity = typeof rawProductivity === 'number' 
        ? Math.min(10, Math.max(0, rawProductivity))
        : Math.min(10, Math.max(0, parseFloat(rawProductivity) || 5));

      return {
        // Normalize the data structure
        id: item._id || item.domain || `item-${Math.random()}`,
        domain: item._id || item.domain || 'Unknown',
        totalDuration: Math.max(0, item.totalDuration || item.duration || 0),
        duration: Math.max(0, item.totalDuration || item.duration || 0),
        sessions: Math.max(1, parseInt(item.sessionCount || item.sessions || 1)),
        productivity,
        lastVisit: item.lastVisit || item.updatedAt || new Date().toISOString(),
        categoryName: item.categoryName || item.category || 'Uncategorized'
      };
    });
  }

  // Enhanced error handling wrapper
  async safeApiCall(apiFunction, fallbackData = []) {
    try {
      const result = await apiFunction();
      return result.success ? result : { success: false, data: fallbackData, error: result.error };
    } catch (error) {
      console.error('API call failed:', error);
      return { 
        success: false, 
        data: fallbackData, 
        error: error.message || 'Unknown error occurred' 
      };
    }
  }
}

export default new DashboardService();
