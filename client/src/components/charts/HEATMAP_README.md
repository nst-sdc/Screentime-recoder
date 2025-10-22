# Activity Heatmap Component

## Overview
The Activity Heatmap visualizes user activity patterns across days and hours with advanced filtering, analytics, and interactive features.

## Features

### Performance Optimization
- Memoized data transformation using React hooks
- Efficient caching mechanism for expensive calculations
- O(1) lookup time using Map data structures
- Optimized re-rendering with React.memo and useCallback

### Filtering Options
- **Time Ranges**: Today, Week, Month, Quarter, Custom
- **Category Filter**: Filter activities by category
- **Domain Filter**: Filter by website domain
- **Productivity Filter**: Minimum productivity score threshold

### Advanced Analytics
- **Peak Hour**: Most active hour of the day
- **Consistency Score**: Activity pattern consistency (0-100)
- **Average Daily Activity**: Mean daily activity duration
- **Focus Intervals**: Consecutive high-activity periods
- **Category Breakdown**: Time spent per category

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support (Tab, Enter, Space)
- High contrast color schemes
- Semantic HTML structure

### Interactive Features
- **Tooltips**: Hover to see detailed cell information
- **Click-to-filter**: Click cells to drill down
- **Visual feedback**: Hover and selection states
- **Responsive design**: Mobile and desktop optimized

## Usage

```jsx
import ActivityHeatmap from './components/charts/ActivityHeatmap';

function Dashboard() {
  const activities = [
    {
      timestamp: '2025-10-23T10:00:00Z',
      duration: 30,
      category: 'Work',
      domain: 'example.com',
      productivityScore: 8
    }
  ];

  const handleCellClick = (cell) => {
    console.log('Selected cell:', cell);
  };

  return (
    <ActivityHeatmap 
      activities={activities}
      onCellClick={handleCellClick}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| activities | Array | Yes | Array of activity objects |
| onCellClick | Function | No | Callback when cell is clicked |

## Activity Object Structure

```javascript
{
  timestamp: String,        // ISO 8601 format
  duration: Number,         // Duration in minutes
  category: String,         // Activity category
  domain: String,           // Website domain
  productivityScore: Number // Score 0-10
}
```

## Custom Hook: useActivityHeatmap

```jsx
import { useActivityHeatmap } from './hooks/useActivityHeatmap';

const {
  filters,
  updateFilters,
  resetFilters,
  heatmapData,
  analytics,
  selectedCell,
  selectCell
} = useActivityHeatmap(activities);
```

## Utility Functions

### transformActivityData(activities, filters)
Transforms raw activity data into heatmap format with filtering.

### calculateAnalytics(heatmapData)
Calculates advanced analytics from heatmap data.

### exportHeatmapData(heatmapData, format)
Exports heatmap data in CSV or JSON format.

## Testing

Run tests with:
```bash
npm test -- --testPathPattern=heatmap
```

## Performance Considerations

- Data caching with automatic cleanup (max 100 entries)
- Memoized calculations using useMemo
- Efficient filtering using Map data structures
- Debounced filter inputs (if needed)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dark Mode

The component automatically adapts to dark mode using Tailwind's dark: prefix.

## Accessibility Compliance

- WCAG 2.1 Level AA compliant
- Keyboard navigable
- Screen reader friendly
- Color contrast ratio > 4.5:1
