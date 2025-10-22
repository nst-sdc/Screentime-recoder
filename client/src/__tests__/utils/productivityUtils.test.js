import { 
  getProductivityColor, 
  getProductivityBadge, 
  getProductivityLabel,
  calculateProductivityStats 
} from '../../utils/productivityUtils';

describe('Productivity Utils', () => {
  describe('getProductivityColor', () => {
    test('returns high color for score >= 7', () => {
      expect(getProductivityColor(8)).toBe('productive-high');
      expect(getProductivityColor(10)).toBe('productive-high');
    });

    test('returns medium color for score 4-6', () => {
      expect(getProductivityColor(5)).toBe('productive-medium');
      expect(getProductivityColor(6)).toBe('productive-medium');
    });

    test('returns low color for score < 4', () => {
      expect(getProductivityColor(2)).toBe('productive-low');
      expect(getProductivityColor(0)).toBe('productive-low');
    });
  });

  describe('getProductivityBadge', () => {
    test('returns correct emoji badges', () => {
      expect(getProductivityBadge(8)).toBe('🟢');
      expect(getProductivityBadge(5)).toBe('🟡');
      expect(getProductivityBadge(2)).toBe('🔴');
    });
  });

  describe('getProductivityLabel', () => {
    test('returns correct labels', () => {
      expect(getProductivityLabel(9)).toBe('High');
      expect(getProductivityLabel(5)).toBe('Medium');
      expect(getProductivityLabel(1)).toBe('Low');
    });
  });

  describe('calculateProductivityStats', () => {
    const activities = [
      { productivityScore: 8 },
      { productivityScore: 5 },
      { productivityScore: 9 },
      { productivityScore: 3 },
      { productivityScore: 6 }
    ];

    test('calculates correct statistics', () => {
      const stats = calculateProductivityStats(activities);
      expect(stats.total).toBe(5);
      expect(stats.high).toBe(2);
      expect(stats.medium).toBe(2);
      expect(stats.low).toBe(1);
      expect(parseFloat(stats.average)).toBeCloseTo(6.2, 1);
    });

    test('handles empty array', () => {
      const stats = calculateProductivityStats([]);
      expect(stats.average).toBe(0);
      expect(stats.total).toBe(0);
    });
  });
});
