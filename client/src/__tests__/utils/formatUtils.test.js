import { formatDuration, formatTimestamp, formatBytes } from '../../utils/formatUtils';

describe('Format Utils', () => {
  describe('formatDuration', () => {
    test('formats seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    test('formats minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s');
    });

    test('formats hours and minutes', () => {
      expect(formatDuration(3660)).toBe('1h 1m');
    });

    test('formats hours only', () => {
      expect(formatDuration(7200)).toBe('2h');
    });

    test('handles zero', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    test('handles negative values', () => {
      expect(formatDuration(-100)).toBe('0m');
    });
  });

  describe('formatTimestamp', () => {
    test('returns "Just now" for recent timestamps', () => {
      const now = new Date();
      expect(formatTimestamp(now.toISOString())).toBe('Just now');
    });

    test('formats minutes ago', () => {
      const past = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatTimestamp(past.toISOString())).toBe('5m ago');
    });

    test('formats hours ago', () => {
      const past = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatTimestamp(past.toISOString())).toBe('3h ago');
    });

    test('formats days ago', () => {
      const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatTimestamp(past.toISOString())).toBe('2d ago');
    });

    test('handles null/undefined', () => {
      expect(formatTimestamp(null)).toBe('N/A');
      expect(formatTimestamp(undefined)).toBe('N/A');
    });
  });

  describe('formatBytes', () => {
    test('formats bytes', () => {
      expect(formatBytes(512)).toBe('512 Bytes');
    });

    test('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    test('formats megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    test('formats gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    test('handles zero', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });
  });
});
