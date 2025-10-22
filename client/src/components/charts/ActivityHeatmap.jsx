import React, { useState, useCallback, useMemo } from 'react';
import { useActivityHeatmap } from '../../hooks/useActivityHeatmap';
import { getTimeRangePresets, exportHeatmapData } from '../../utils/heatmapUtils';

/**
 * Enhanced Activity Heatmap Component
 * Features: Performance optimization, filters, analytics, accessibility, interactivity
 */
const ActivityHeatmap = ({ activities = [], onCellClick }) => {
  const {
    filters,
    updateFilters,
    resetFilters,
    heatmapData,
    analytics,
    selectedCell,
    selectCell,
    clearSelection
  } = useActivityHeatmap(activities);

  const [hoveredCell, setHoveredCell] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  // Handle time range change
  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
    const presets = getTimeRangePresets();
    if (presets[range]) {
      updateFilters({
        startDate: presets[range].startDate,
        endDate: presets[range].endDate
      });
    }
  }, [updateFilters]);

  // Handle cell interaction
  const handleCellClick = useCallback((cell) => {
    selectCell(cell);
    if (onCellClick) {
      onCellClick(cell);
    }
  }, [selectCell, onCellClick]);

  // Calculate color intensity
  const getColorIntensity = useCallback((value) => {
    if (!heatmapData.length) return 'bg-gray-100 dark:bg-gray-800';
    
    const maxValue = Math.max(...heatmapData.map(d => d.value));
    const intensity = maxValue > 0 ? (value / maxValue) * 100 : 0;
    
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 25) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 50) return 'bg-blue-400 dark:bg-blue-700';
    if (intensity < 75) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-300';
  }, [heatmapData]);

  // Generate days array
  const days = useMemo(() => {
    const uniqueDays = [...new Set(heatmapData.map(d => d.day))].sort();
    return uniqueDays.slice(0, 7); // Show last 7 days
  }, [heatmapData]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="activity-heatmap p-4" role="region" aria-label="Activity Heatmap">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Activity Heatmap</h2>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['today', 'week', 'month', 'quarter'].map(range => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              aria-pressed={timeRange === range}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Filter by category"
          onChange={(e) => updateFilters({ category: e.target.value || null })}
          className="px-3 py-1 border rounded text-sm"
          aria-label="Filter by category"
        />
        <input
          type="text"
          placeholder="Filter by domain"
          onChange={(e) => updateFilters({ domain: e.target.value || null })}
          className="px-3 py-1 border rounded text-sm"
          aria-label="Filter by domain"
        />
        <button
          onClick={resetFilters}
          className="px-3 py-1 bg-gray-300 rounded text-sm"
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${hours.length}, 1fr)` }}>
            {/* Hour headers */}
            <div className="w-20"></div>
            {hours.map(hour => (
              <div key={hour} className="text-xs text-center p-1">
                {hour}h
              </div>
            ))}

            {/* Day rows */}
            {days.map(day => (
              <React.Fragment key={day}>
                <div className="text-xs font-medium p-1 flex items-center">
                  {new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                {hours.map(hour => {
                  const cell = heatmapData.find(d => d.day === day && d.hour === hour);
                  const value = cell ? cell.value : 0;
                  const isSelected = selectedCell?.day === day && selectedCell?.hour === hour;
                  const isHovered = hoveredCell?.day === day && hoveredCell?.hour === hour;

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-8 rounded cursor-pointer transition-all ${getColorIntensity(value)} ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      } ${isHovered ? 'scale-110' : ''}`}
                      onClick={() => cell && handleCellClick(cell)}
                      onMouseEnter={() => cell && setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${day} at ${hour}:00, ${value} minutes of activity`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          cell && handleCellClick(cell);
                        }
                      }}
                    >
                      {/* Tooltip */}
                      {isHovered && cell && (
                        <div className="absolute z-10 bg-black text-white text-xs rounded p-2 mt-10 -ml-20">
                          <div>Time: {hour}:00</div>
                          <div>Activities: {cell.count}</div>
                          <div>Duration: {Math.round(cell.value)} min</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Peak Hour</h3>
          <p className="text-2xl">{analytics.peakHour}:00</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Consistency Score</h3>
          <p className="text-2xl">{analytics.consistency}%</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Avg Daily Activity</h3>
          <p className="text-2xl">{analytics.averageDaily} min</p>
        </div>
      </div>

      {/* Focus Intervals */}
      {analytics.focusIntervals.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Top Focus Intervals</h3>
          <ul className="space-y-1">
            {analytics.focusIntervals.map((interval, idx) => (
              <li key={idx} className="text-sm">
                {interval.day}: {interval.start}:00 - {interval.end}:00 ({interval.duration}h)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(analytics.categoryBreakdown).length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Time by Category</h3>
          <div className="space-y-2">
            {Object.entries(analytics.categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, time]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span>{category}</span>
                  <span>{Math.round(time)} min</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;
