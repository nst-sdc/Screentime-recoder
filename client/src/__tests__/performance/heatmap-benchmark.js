import { transformActivityData, calculateAnalytics } from '../../utils/heatmapUtils';

/**
 * Performance benchmarks for heatmap utilities
 */

// Generate large dataset
function generateLargeDataset(size) {
  const activities = [];
  const now = new Date();
  
  for (let i = 0; i < size; i++) {
    activities.push({
      timestamp: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      duration: Math.floor(Math.random() * 60) + 1,
      category: ['Work', 'Entertainment', 'Social', 'Education'][Math.floor(Math.random() * 4)],
      domain: `example${Math.floor(Math.random() * 100)}.com`,
      productivityScore: Math.floor(Math.random() * 10) + 1
    });
  }
  
  return activities;
}

describe('Heatmap Performance Benchmarks', () => {
  test('transformActivityData with 1000 activities', () => {
    const activities = generateLargeDataset(1000);
    const start = performance.now();
    transformActivityData(activities);
    const end = performance.now();
    const time = end - start;
    
    console.log(`Transform 1000 activities: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(100); // Should complete in under 100ms
  });

  test('transformActivityData with 10000 activities', () => {
    const activities = generateLargeDataset(10000);
    const start = performance.now();
    transformActivityData(activities);
    const end = performance.now();
    const time = end - start;
    
    console.log(`Transform 10000 activities: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(500); // Should complete in under 500ms
  });

  test('calculateAnalytics performance', () => {
    const activities = generateLargeDataset(5000);
    const heatmapData = transformActivityData(activities);
    
    const start = performance.now();
    calculateAnalytics(heatmapData);
    const end = performance.now();
    const time = end - start;
    
    console.log(`Calculate analytics: ${time.toFixed(2)}ms`);
    expect(time).toBeLessThan(100); // Should complete in under 100ms
  });

  test('caching effectiveness', () => {
    const activities = generateLargeDataset(1000);
    
    // First call (no cache)
    const start1 = performance.now();
    transformActivityData(activities);
    const time1 = performance.now() - start1;
    
    // Second call (with cache)
    const start2 = performance.now();
    transformActivityData(activities);
    const time2 = performance.now() - start2;
    
    console.log(`First call: ${time1.toFixed(2)}ms, Second call: ${time2.toFixed(2)}ms`);
    console.log(`Speed improvement: ${((time1 - time2) / time1 * 100).toFixed(2)}%`);
    
    expect(time2).toBeLessThan(time1); // Cached call should be faster
  });
});
