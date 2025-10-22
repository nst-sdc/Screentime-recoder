import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getProductivityBadge, getProductivityColor } from '../../utils/productivityUtils';
import { formatDuration } from '../../utils/formatUtils';

const ActivityGrouping = ({ groups, expandedGroups, toggleGroup, groupBy, onActivityClick }) => {
  const getGroupLabel = (groupKey) => {
    if (groupBy === 'category') return groupKey;
    if (groupBy === 'productivity') {
      const score = parseInt(groupKey);
      if (score >= 7) return '🟢 High Productivity (7-10)';
      if (score >= 4) return '🟡 Medium Productivity (4-6)';
      return '🔴 Low Productivity (0-3)';
    }
    return groupKey;
  };

  return (
    <div className="activity-grouping" role="region" aria-label="Grouped Activities">
      {Object.entries(groups).map(([groupKey, items]) => {
        const isExpanded = expandedGroups.has(groupKey);
        const totalDuration = items.reduce((sum, item) => sum + (item.duration || 0), 0);
        const avgProductivity = items.reduce((sum, item) => sum + (item.productivityScore || 0), 0) / items.length;

        return (
          <div key={groupKey} className="group-container">
            <button
              className="group-header"
              onClick={() => toggleGroup(groupKey)}
              aria-expanded={isExpanded}
              aria-controls={`group-${groupKey}`}
            >
              <div className="group-header-content">
                <div className="group-icon">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <div className="group-info">
                  <h3 className="group-title">{getGroupLabel(groupKey)}</h3>
                  <div className="group-stats">
                    <span className="group-count">{items.length} activities</span>
                    <span className="group-duration">{formatDuration(totalDuration)}</span>
                    <span className={`group-productivity ${getProductivityColor(avgProductivity)}`}>
                      Avg: {avgProductivity.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div id={`group-${groupKey}`} className="group-items">
                <table className="group-table">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Duration</th>
                      <th>Productivity</th>
                      <th>Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr 
                        key={item.id || index}
                        className="group-item"
                        onClick={() => onActivityClick && onActivityClick(item)}
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && onActivityClick) {
                            onActivityClick(item);
                          }
                        }}
                      >
                        <td>
                          <div className="item-domain">
                            <span>{item.domain}</span>
                            {item.category && (
                              <span className={`category-tag category-${item.category.toLowerCase()}`}>
                                {item.category}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{formatDuration(item.duration)}</td>
                        <td>
                          <span className={`productivity-badge ${getProductivityColor(item.productivityScore)}`}>
                            {item.productivityScore || 0}/10
                          </span>
                        </td>
                        <td>{item.sessionCount || 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ActivityGrouping;
