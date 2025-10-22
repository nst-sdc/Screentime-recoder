import { transformActivityData, calculateAnalytics } from '../../utils/heatmapUtils';

describe('heatmapUtils', () => {
  const mockActivities = [
    {
      timestamp: '2025-10-23T10:00:00Z',
      duration: 30,
      category: 'Work',
      domain: 'example.com',
      productivityScore: 8
    },
    {
      timestamp: '2025-10-23T10:30:00Z',
      duration: 45,
      category: 'Work',
      domain: 'example.com',
      productivityScore: 9
    },
    {
      timestamp: '2025-10-23T14:00:00Z',
      duration: 20,
      category: 'Entertainment',
      domain: 'youtube.com',
      productivityScore: 3
    }
  ];

  describe('transformActivityData', () => {
    test('transforms activities into heatmap format', () => {
      const result = transformActivityData(mockActivities);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('day');
      expect(result[0]).toHaveProperty('hour');
      expect(result[0]).toHaveProperty('value');
    });

    test('filters by category', () => {
      const result = transformActivityData(mockActivities, { category: 'Work' });
      result.forEach(cell => {
        cell.activities.forEach(activity => {
          expect(activity.category).toBe('Work');
        });
      });
    });

    test('filters by productivity score', () => {
      const result = transformActivityData(mockActivities, { minProductivity: 7 });
      result.forEach(cell => {
        cell.activities.forEach(activity => {
          expect(activity.productivityScore).toBeGreaterThanOrEqual(7);
        });
      });
    });
  });

  describe('calculateAnalytics', () => {
    test('calculates analytics from heatmap data', () => {
      const heatmapData = transformActivityData(mockActivities);
      const analytics = calculateAnalytics(heatmapData);
      
      expect(analytics).toHaveProperty('peakHour');
      expect(analytics).toHaveProperty('mostActiveDay');
      expect(analytics).toHaveProperty('consistency');
      expect(analytics).toHaveProperty('focusIntervals');
      expect(analytics).toHaveProperty('categoryBreakdown');
    });

    test('handles empty data gracefully', () => {
      const analytics = calculateAnalytics([]);
      expect(analytics.peakHour).toBeNull();
      expect(analytics.consistency).toBe(0);
    });
  });
});
