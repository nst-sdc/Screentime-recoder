import { describe, test, expect } from '@jest/globals';

describe('Simple Test', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should work with async', async () => {
    const result = await Promise.resolve('hello');
    expect(result).toBe('hello');
  });
});
