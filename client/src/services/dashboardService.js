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
      return response.data;
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      throw error;
    }
  }

  // Get daily usage pattern
  async getDailyUsage(date = new Date().toISOString().split('T')[0]) {
    try {
      const response = await this.api.get(`/activity/daily-usage`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily usage:', error);
      throw error;
    }
  }

  // Get top websites/applications
  async getTopSites(limit = 10) {
    try {
      const response = await this.api.get(`/activity/top-sites`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top sites:', error);
      throw error;
    }
  }

  // Get active sessions
  async getActiveSessions() {
    try {
      const response = await this.api.get('/activity/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
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

  // Transform daily usage data for line chart
  transformDailyUsage(backendData) {
    if (!backendData || !Array.isArray(backendData)) {
      return [];
    }

    return backendData.map(item => ({
      time: item.time, // Should already be in HH:MM format from backend
      usage: item.usage // Should already be in minutes from backend
    }));
  }

  // Transform top sites data
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
}

export default new DashboardService();
