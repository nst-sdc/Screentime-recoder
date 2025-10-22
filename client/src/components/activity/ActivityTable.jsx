import React from 'react';
import { ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { getProductivityBadge, getProductivityColor } from '../../utils/productivityUtils';
import { formatDuration, formatTimestamp } from '../../utils/formatUtils';

const ActivityTable = ({ 
  activities, 
  sortBy, 
  sortOrder, 
  onSort, 
  onActivityClick,
  loading 
}) => {
  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (loading) {
    return (
      <div className="activity-table loading" aria-busy="true" aria-live="polite">
        <div className="loading-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="activity-table-container" role="region" aria-label="Activity Table">
      <table className="activity-table" role="table">
        <thead>
          <tr role="row">
            <th role="columnheader" onClick={() => onSort('domain')} className="sortable">
              Domain <SortIcon field="domain" />
            </th>
            <th role="columnheader" onClick={() => onSort('category')} className="sortable">
              Category <SortIcon field="category" />
            </th>
            <th role="columnheader" onClick={() => onSort('duration')} className="sortable">
              Duration <SortIcon field="duration" />
            </th>
            <th role="columnheader" onClick={() => onSort('productivityScore')} className="sortable">
              Productivity <SortIcon field="productivityScore" />
            </th>
            <th role="columnheader" onClick={() => onSort('sessionCount')} className="sortable">
              Sessions <SortIcon field="sessionCount" />
            </th>
            <th role="columnheader" onClick={() => onSort('timestamp')} className="sortable">
              Last Active <SortIcon field="timestamp" />
            </th>
            <th role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr 
              key={activity.id || index} 
              role="row"
              className="activity-row"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && onActivityClick) {
                  onActivityClick(activity);
                }
              }}
            >
              <td role="cell" className="domain-cell">
                <div className="domain-info">
                  <span className="domain-name" title={activity.domain}>
                    {activity.domain}
                  </span>
                </div>
              </td>
              <td role="cell">
                <span className={`category-badge category-${activity.category?.toLowerCase()}`}>
                  {activity.category}
                </span>
              </td>
              <td role="cell" className="duration-cell">
                {formatDuration(activity.duration)}
              </td>
              <td role="cell">
                <div className="productivity-cell">
                  <span 
                    className={`productivity-badge ${getProductivityColor(activity.productivityScore)}`}
                    aria-label={`Productivity score: ${activity.productivityScore} out of 10`}
                  >
                    {activity.productivityScore || 0}/10
                  </span>
                  {getProductivityBadge(activity.productivityScore)}
                </div>
              </td>
              <td role="cell" className="sessions-cell">
                {activity.sessionCount || 1}
              </td>
              <td role="cell" className="timestamp-cell">
                {formatTimestamp(activity.timestamp)}
              </td>
              <td role="cell" className="actions-cell">
                {onActivityClick && (
                  <button
                    className="action-icon-button"
                    onClick={() => onActivityClick(activity)}
                    aria-label={`View details for ${activity.domain}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;
