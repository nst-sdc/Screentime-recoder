import { filterActivities, sortActivities, groupActivities } from '../../utils/activityUtils';

describe('Activity Utils', () => {
  const mockActivities = [
    { id: 1, domain: 'github.com', category: 'Work', duration: 3600, productivityScore: 8 },
    { id: 2, domain: 'youtube.com', category: 'Entertainment', duration: 1800, productivityScore: 3 },
    { id: 3, domain: 'linkedin.com', category: 'Social', duration: 900, productivityScore: 5 },
    { id: 4, domain: 'coursera.org', category: 'Education', duration: 7200, productivityScore: 9 }
  ];

  describe('filterActivities', () => {
    test('filters by category', () => {
      const result = filterActivities(mockActivities, { category: 'Work', productivity: 'all', search: '' });
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Work');
    });

    test('filters by productivity level', () => {
      const result = filterActivities(mockActivities, { category: 'all', productivity: 'high', search: '' });
      expect(result).toHaveLength(2);
      expect(result.every(a => a.productivityScore >= 7)).toBe(true);
    });

    test('filters by search query', () => {
      const result = filterActivities(mockActivities, { category: 'all', productivity: 'all', search: 'git' });
      expect(result).toHaveLength(1);
      expect(result[0].domain).toBe('github.com');
    });

    test('returns all activities with no filters', () => {
      const result = filterActivities(mockActivities, { category: 'all', productivity: 'all', search: '' });
      expect(result).toHaveLength(4);
    });
  });

  describe('sortActivities', () => {
    test('sorts by duration descending', () => {
      const result = sortActivities(mockActivities, 'duration', 'desc');
      expect(result[0].duration).toBe(7200);
      expect(result[3].duration).toBe(900);
    });

    test('sorts by duration ascending', () => {
      const result = sortActivities(mockActivities, 'duration', 'asc');
      expect(result[0].duration).toBe(900);
      expect(result[3].duration).toBe(7200);
    });

    test('sorts by domain alphabetically', () => {
      const result = sortActivities(mockActivities, 'domain', 'asc');
      expect(result[0].domain).toBe('coursera.org');
    });
  });

  describe('groupActivities', () => {
    test('groups by category', () => {
      const result = groupActivities(mockActivities, 'category');
      expect(Object.keys(result)).toHaveLength(4);
      expect(result['Work']).toHaveLength(1);
      expect(result['Education']).toHaveLength(1);
    });

    test('groups by productivity', () => {
      const result = groupActivities(mockActivities, 'productivity');
      expect(result['high']).toHaveLength(2);
      expect(result['medium']).toHaveLength(1);
      expect(result['low']).toHaveLength(1);
    });

    test('groups by domain', () => {
      const result = groupActivities(mockActivities, 'domain');
      expect(Object.keys(result)).toHaveLength(4);
    });
  });
});
