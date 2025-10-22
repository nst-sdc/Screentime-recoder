/**
 * Example backend routes for Activity Heatmap
 * Add these routes to your Express server
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/activities
 * Fetch activities with optional filters
 */
router.get('/activities', async (req, res) => {
  try {
    const { startDate, endDate, category, domain, minProductivity } = req.query;
    
    // Build query based on filters
    const query = {};
    
    if (startDate) {
      query.timestamp = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.timestamp = { ...query.timestamp, $lte: new Date(endDate) };
    }
    if (category) {
      query.category = category;
    }
    if (domain) {
      query.domain = domain;
    }
    if (minProductivity) {
      query.productivityScore = { $gte: parseInt(minProductivity) };
    }
    
    // Fetch from database (example using MongoDB)
    // const activities = await Activity.find(query).sort({ timestamp: -1 }).limit(10000);
    
    // Mock response
    const activities = [
      {
        timestamp: new Date().toISOString(),
        duration: 30,
        category: 'Work',
        domain: 'example.com',
        productivityScore: 8
      }
    ];
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/activities/heatmap
 * Fetch pre-aggregated heatmap data for better performance
 */
router.get('/activities/heatmap', async (req, res) => {
  try {
    const { startDate, endDate, category, domain } = req.query;
    
    // Aggregate data on the backend for better performance
    const heatmapData = [];
    
    res.json(heatmapData);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics
 * Fetch analytics data
 */
router.get('/analytics', async (req, res) => {
  try {
    const analytics = {
      peakHour: 10,
      mostActiveDay: new Date().toISOString().split('T')[0],
      averageDaily: 240,
      consistency: 85,
      focusIntervals: [],
      categoryBreakdown: {}
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/categories
 * Get list of available categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = ['Work', 'Entertainment', 'Social', 'Education', 'Other'];
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/domains
 * Get list of available domains
 */
router.get('/domains', async (req, res) => {
  try {
    const domains = ['example.com', 'github.com', 'youtube.com'];
    res.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
