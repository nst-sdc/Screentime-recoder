import React, { useState, useMemo, useCallback } from 'react';
import { 
  Download, Filter, Search, ChevronDown, ChevronUp, 
  TrendingUp, TrendingDown, Clock, Target, AlertCircle 
} from 'lucide-react';
import ActivityTable from './ActivityTable';
import ActivityFilters from './ActivityFilters';
import ActivityExport from './ActivityExport';
import ActivityGrouping from './ActivityGrouping';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import { filterActivities, sortActivities, groupActivities } from '../../utils/activityUtils';
import { getProductivityBadge, getProductivityColor } from '../../utils/productivityUtils';

const EnhancedActivitySummary = ({ 
  activities = [], 
  loading = false, 
  error = null,
  goals = [],
  onActivityClick = null 
}) => {
  // State management
  const [maxItems, setMaxItems] = useState(8);
  const [sortBy, setSortBy] = useState('duration');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterProductivity, setFilterProductivity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Filter, sort and group activities
  const processedActivities = useMemo(() => {
    let result = filterActivities(activities, {
      category: filterCategory,
      productivity: filterProductivity,
      search: searchQuery
    });

    result = sortActivities(result, sortBy, sortOrder);

    if (groupBy !== 'none') {
      return groupActivities(result, groupBy);
    }

    return result.slice(0, maxItems);
  }, [activities, filterCategory, filterProductivity, searchQuery, sortBy, sortOrder, groupBy, maxItems]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupKey) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }, []);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    exportToCSV(activities, 'activity-summary');
  }, [activities]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(activities, 'activity-summary');
  }, [activities]);

  // Toggle sort order
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy]);

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Empty state
  if (!loading && activities.length === 0) {
    return <EmptyState />;
  }

  // Calculate productivity insights
  const productivityInsights = useMemo(() => {
    if (activities.length === 0) return null;

    const totalDuration = activities.reduce((sum, act) => sum + (act.duration || 0), 0);
    const avgProductivity = activities.reduce((sum, act) => sum + (act.productivityScore || 0), 0) / activities.length;
    const productiveTime = activities
      .filter(act => (act.productivityScore || 0) >= 7)
      .reduce((sum, act) => sum + (act.duration || 0), 0);

    return {
      totalDuration,
      avgProductivity: avgProductivity.toFixed(1),
      productiveTime,
      productivePercentage: ((productiveTime / totalDuration) * 100).toFixed(1)
    };
  }, [activities]);

  // Goal progress
  const goalProgress = useMemo(() => {
    if (!goals || goals.length === 0) return null;

    return goals.map(goal => {
      const relevantActivities = activities.filter(act => 
        goal.categories?.includes(act.category)
      );
      const totalTime = relevantActivities.reduce((sum, act) => sum + (act.duration || 0), 0);
      const progress = Math.min((totalTime / goal.targetDuration) * 100, 100);

      return {
        ...goal,
        currentDuration: totalTime,
        progress: progress.toFixed(1)
      };
    });
  }, [activities, goals]);

  return (
    <div className="enhanced-activity-summary" role="region" aria-label="Recent Activity Summary">
      {/* Header Section */}
      <div className="summary-header">
        <div className="header-title">
          <h2>Recent Activity Summary</h2>
          <span className="activity-count" aria-live="polite">
            {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
          </span>
        </div>

        <div className="header-actions">
          <button
            className="action-button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="activity-filters"
          >
            <Filter size={16} />
            <span>Filters</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <button
            className="action-button"
            onClick={() => setShowExport(!showExport)}
            aria-expanded={showExport}
            aria-controls="export-options"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Productivity Insights */}
      {productivityInsights && (
        <div className="productivity-insights" role="complementary" aria-label="Productivity Insights">
          <div className="insight-card">
            <Clock size={20} className="insight-icon" />
            <div className="insight-content">
              <span className="insight-label">Total Time</span>
              <span className="insight-value">
                {Math.floor(productivityInsights.totalDuration / 3600)}h {Math.floor((productivityInsights.totalDuration % 3600) / 60)}m
              </span>
            </div>
          </div>

          <div className="insight-card">
            <TrendingUp size={20} className="insight-icon productive" />
            <div className="insight-content">
              <span className="insight-label">Avg Productivity</span>
              <span className="insight-value">{productivityInsights.avgProductivity}/10</span>
            </div>
          </div>

          <div className="insight-card">
            <Target size={20} className="insight-icon" />
            <div className="insight-content">
              <span className="insight-label">Productive Time</span>
              <span className="insight-value">{productivityInsights.productivePercentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Goal Progress */}
      {goalProgress && goalProgress.length > 0 && (
        <div className="goal-progress-section" role="complementary" aria-label="Goal Progress">
          <h3>Goal Progress</h3>
          <div className="goal-list">
            {goalProgress.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-header">
                  <span className="goal-name">{goal.name}</span>
                  <span className="goal-percentage">{goal.progress}%</span>
                </div>
                <div className="goal-bar" role="progressbar" aria-valuenow={goal.progress} aria-valuemin="0" aria-valuemax="100">
                  <div className="goal-fill" style={{ width: `${goal.progress}%` }} />
                </div>
                <div className="goal-details">
                  <span>{Math.floor(goal.currentDuration / 3600)}h / {Math.floor(goal.targetDuration / 3600)}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <ActivityFilters
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterProductivity={filterProductivity}
          setFilterProductivity={setFilterProductivity}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={handleSort}
          sortOrder={sortOrder}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          maxItems={maxItems}
          setMaxItems={setMaxItems}
        />
      )}

      {/* Export Options */}
      {showExport && (
        <ActivityExport
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          activityCount={activities.length}
        />
      )}

      {/* Activity List/Table */}
      {groupBy !== 'none' ? (
        <ActivityGrouping
          groups={processedActivities}
          expandedGroups={expandedGroups}
          toggleGroup={toggleGroup}
          groupBy={groupBy}
          onActivityClick={onActivityClick}
        />
      ) : (
        <ActivityTable
          activities={processedActivities}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onActivityClick={onActivityClick}
          loading={loading}
        />
      )}

      {/* Load More */}
      {groupBy === 'none' && activities.length > maxItems && (
        <div className="load-more">
          <button
            className="load-more-button"
            onClick={() => setMaxItems(prev => prev + 8)}
            aria-label="Load more activities"
          >
            Load More ({activities.length - maxItems} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedActivitySummary;
