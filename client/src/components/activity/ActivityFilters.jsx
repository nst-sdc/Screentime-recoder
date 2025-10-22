import React from 'react';
import { Search, X } from 'lucide-react';

const ActivityFilters = ({
  filterCategory,
  setFilterCategory,
  filterProductivity,
  setFilterProductivity,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  groupBy,
  setGroupBy,
  maxItems,
  setMaxItems
}) => {
  const categories = ['all', 'Work', 'Social', 'Entertainment', 'Education', 'Shopping', 'News', 'Other'];
  const productivityLevels = ['all', 'high', 'medium', 'low'];
  const sortOptions = [
    { value: 'duration', label: 'Duration' },
    { value: 'productivityScore', label: 'Productivity' },
    { value: 'timestamp', label: 'Time' },
    { value: 'sessionCount', label: 'Sessions' },
    { value: 'domain', label: 'Domain' }
  ];
  const groupOptions = [
    { value: 'none', label: 'No Grouping' },
    { value: 'category', label: 'By Category' },
    { value: 'domain', label: 'By Domain' },
    { value: 'productivity', label: 'By Productivity' }
  ];
  const itemOptions = [4, 8, 12, 16, 20, 50];

  return (
    <div id="activity-filters" className="activity-filters" role="search">
      {/* Search Bar */}
      <div className="filter-group search-group">
        <label htmlFor="activity-search" className="filter-label">
          Search
        </label>
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            id="activity-search"
            type="text"
            placeholder="Search by domain or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search activities"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <label htmlFor="category-filter" className="filter-label">
          Category
        </label>
        <select
          id="category-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
          aria-label="Filter by category"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Productivity Filter */}
      <div className="filter-group">
        <label htmlFor="productivity-filter" className="filter-label">
          Productivity
        </label>
        <select
          id="productivity-filter"
          value={filterProductivity}
          onChange={(e) => setFilterProductivity(e.target.value)}
          className="filter-select"
          aria-label="Filter by productivity level"
        >
          {productivityLevels.map(level => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="filter-group">
        <label htmlFor="sort-filter" className="filter-label">
          Sort By
        </label>
        <select
          id="sort-filter"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
          aria-label="Sort activities by"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Group By */}
      <div className="filter-group">
        <label htmlFor="group-filter" className="filter-label">
          Group By
        </label>
        <select
          id="group-filter"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="filter-select"
          aria-label="Group activities by"
        >
          {groupOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Items Per Page */}
      {groupBy === 'none' && (
        <div className="filter-group">
          <label htmlFor="items-filter" className="filter-label">
            Items
          </label>
          <select
            id="items-filter"
            value={maxItems}
            onChange={(e) => setMaxItems(Number(e.target.value))}
            className="filter-select"
            aria-label="Number of items to display"
          >
            {itemOptions.map(num => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reset Filters */}
      <div className="filter-group">
        <button
          className="reset-button"
          onClick={() => {
            setFilterCategory('all');
            setFilterProductivity('all');
            setSearchQuery('');
            setGroupBy('none');
            setMaxItems(8);
          }}
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ActivityFilters;
