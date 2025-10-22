# Quick Reference - Enhanced Activity Summary

## Installation
```bash
./enhance-recent-activity-summary.sh
cd client && ./setup-dependencies.sh
```

## Running Tests
```bash
npm test                 # Run all tests
npm run test:ui          # Run with UI
npm run test:coverage    # With coverage report
```

## Component Usage
```jsx
import EnhancedActivitySummary from './components/activity/EnhancedActivitySummary';

<EnhancedActivitySummary
  activities={activities}      // Required: Array of activity objects
  goals={goals}               // Optional: Array of goal objects
  loading={false}             // Optional: Loading state
  error={null}                // Optional: Error object
  onActivityClick={handler}   // Optional: Click handler
/>
```

## Activity Data Format
```javascript
{
  id: 1,
  domain: "github.com",
  category: "Work",
  duration: 3600,           // seconds
  productivityScore: 8,     // 0-10
  sessionCount: 3,
  timestamp: "2025-10-23T10:00:00Z"
}
```

## Key Features
- **Sorting**: Duration, Productivity, Time, Sessions, Domain
- **Filtering**: Category, Productivity Level, Search
- **Grouping**: Category, Domain, Productivity
- **Export**: CSV, JSON
- **Views**: 4, 8, 12, 16, 20, 50 items per page

## Keyboard Shortcuts
- `Tab`: Navigate between elements
- `Enter`: Activate buttons/select items
- `Space`: Toggle checkboxes
- `Escape`: Close modals/dropdowns
- `Arrow Keys`: Navigate within lists

## Customization
- **Colors**: Edit `EnhancedActivitySummary.css`
- **Categories**: Update `ActivityFilters.jsx`
- **Export Format**: Modify `exportUtils.js`
- **Grouping Logic**: Adjust `activityUtils.js`

## API Endpoints
```javascript
// Fetch activities
GET /api/activities/recent
Headers: { Authorization: 'Bearer <token>' }

// Fetch goals
GET /api/goals
Headers: { Authorization: 'Bearer <token>' }
```

## Troubleshooting
| Issue | Solution |
|-------|----------|
| No data showing | Check API endpoints and auth token |
| Export not working | Check browser download permissions |
| Tests failing | Run `npm install` for dependencies |
| Styles broken | Import CSS file in component |

## Performance Tips
- Use pagination for large datasets
- Implement virtual scrolling for 100+ items
- Cache API responses
- Debounce search input
- Lazy load grouped items

## Accessibility Checklist
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG AA
- ✅ Screen reader tested
- ✅ Semantic HTML structure

## Browser Support
| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |

## File Locations
```
client/src/
├── components/activity/       # All activity components
├── utils/                     # Helper functions
├── hooks/                     # Custom hooks
└── __tests__/                # Test files
```

## Common Tasks

### Add New Filter
1. Update `ActivityFilters.jsx`
2. Add filter logic in `activityUtils.js`
3. Update tests

### Add Export Format
1. Create export function in `exportUtils.js`
2. Add button in `ActivityExport.jsx`
3. Add tests

### Modify Productivity Thresholds
1. Edit `productivityUtils.js`
2. Update tests
3. Update documentation

## Support & Resources
- Documentation: `ENHANCED_ACTIVITY_SUMMARY_README.md`
- Tests: `client/src/__tests__/`
- Examples: Test files contain usage examples

## Version
- Version: 1.0.0
- Last Updated: October 2025
- Compatibility: React 18+, Node 16+
