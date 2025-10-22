import { useState, useEffect, useMemo, useCallback } from 'react';
import { transformActivityData, calculateAnalytics } from '../utils/heatmapUtils';

/**
 * Custom hook for managing Activity Heatmap state and logic
 */
export function useActivityHeatmap(initialData = []) {
  const [activities, setActivities] = useState(initialData);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    category: null,
    domain: null,
    minProductivity: null
  });
  const [selectedCell, setSelectedCell] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized transformed data
  const heatmapData = useMemo(() => {
    return transformActivityData(activities, filters);
  }, [activities, filters]);

  // Memoized analytics
  const analytics = useMemo(() => {
    return calculateAnalytics(heatmapData);
  }, [heatmapData]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      category: null,
      domain: null,
      minProductivity: null
    });
  }, []);

  // Select cell
  const selectCell = useCallback((cell) => {
    setSelectedCell(cell);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedCell(null);
  }, []);

  return {
    activities,
    setActivities,
    filters,
    updateFilters,
    resetFilters,
    heatmapData,
    analytics,
    selectedCell,
    selectCell,
    clearSelection,
    isLoading,
    setIsLoading
  };
}
