# Migration Guide - Enhanced Activity Summary

## Overview
This guide helps you migrate from the old Recent Activity Summary to the new Enhanced Activity Summary.

## Breaking Changes
None. The new component is backward compatible.

## Step-by-Step Migration

### 1. Backup Current Implementation
```bash
cp client/src/pages/Dashboard.jsx client/src/pages/Dashboard.jsx.backup
```

### 2. Install Dependencies
```bash
cd client
npm install lucide-react
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### 3. Update Imports
**Before:**
```jsx
import AppList from '../components/charts/AppList';
```

**After:**
```jsx
import EnhancedActivitySummary from '../components/activity/EnhancedActivitySummary';
import '../components/activity/EnhancedActivitySummary.css';
```

### 4. Update Component Usage
**Before:**
```jsx
<AppList activities={activities} maxItems={8} />
```

**After:**
```jsx
<EnhancedActivitySummary
  activities={activities}
  loading={loading}
  error={error}
  onActivityClick={handleActivityClick}
/>
```

### 5. Update Data Fetching (Optional)
```jsx
// Add error handling
const [error, setError] = useState(null);

try {
  const data = await fetchActivities();
  setActivities(data);
} catch (err) {
  setError(err);
}
```

### 6. Add Goal Integration (Optional)
```jsx
const [goals, setGoals] = useState([]);

// Fetch goals
const fetchGoals = async () => {
  const response = await fetch('/api/goals', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  setGoals(data.goals);
};

// Pass to component
<EnhancedActivitySummary
  activities={activities}
  goals={goals}
  // ...
/>
```

## API Changes

### Old Endpoint (if applicable)
```
GET /api/activities?limit=8
```

### Recommended New Endpoint
```
GET /api/activities/recent?limit=50
```

## Data Format Changes

### Old Format (Still Supported)
```javascript
{
  domain: "github.com",
  time: 3600,
  sessions: 3
}
```

### New Format (Recommended)
```javascript
{
  id: 1,
  domain: "github.com",
  category: "Work",
  duration: 3600,
  productivityScore: 8,
  sessionCount: 3,
  timestamp: "2025-10-23T10:00:00Z"
}
```

## Feature Mapping

| Old Feature | New Feature | Notes |
|------------|-------------|-------|
| maxItems prop | maxItems filter | Now user-adjustable |
| Fixed sorting | Dynamic sorting | 5 sort options |
| No filtering | Multiple filters | Category, productivity, search |
| List view only | Table + Groups | Toggle between views |
| No export | CSV + JSON | Download functionality |
| Basic display | Rich insights | Productivity metrics |

## Testing Your Migration

### 1. Visual Check
- [ ] Activities display correctly
- [ ] Sorting works
- [ ] Filters function
- [ ] Export buttons appear
- [ ] Responsive on mobile

### 2. Functional Check
- [ ] Click activity row
- [ ] Toggle filters
- [ ] Export to CSV
- [ ] Export to JSON
- [ ] Group activities
- [ ] Search functionality

### 3. Accessibility Check
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Focus indicators
- [ ] ARIA labels

## Rollback Plan
If you need to rollback:

```bash
# Restore backup
cp client/src/pages/Dashboard.jsx.backup client/src/pages/Dashboard.jsx

# Remove new files (optional)
rm -rf client/src/components/activity
rm -rf client/src/utils/activityUtils.js
rm -rf client/src/utils/exportUtils.js
rm -rf client/src/utils/productivityUtils.js
rm -rf client/src/utils/formatUtils.js
```

## Common Migration Issues

### Issue: Activities Not Displaying
**Solution:** Check data format matches expected structure

### Issue: Styling Broken
**Solution:** Ensure CSS file is imported

### Issue: Export Not Working
**Solution:** Check browser permissions for downloads

### Issue: Tests Failing
**Solution:** Run `npm install` and check test configuration

## Performance Considerations

### Before Migration
- Limited to 8 items
- Fixed sorting
- Simple rendering

### After Migration
- Up to 50 items (adjustable)
- Dynamic sorting/filtering
- Optimized with memoization

**Tip:** For datasets > 100 items, consider implementing virtual scrolling.

## Timeline

### Phase 1: Installation (5 minutes)
- Run installation script
- Install dependencies

### Phase 2: Testing (15 minutes)
- Test in development
- Verify all features work
- Check mobile responsiveness

### Phase 3: Deployment (10 minutes)
- Deploy to staging
- Run smoke tests
- Deploy to production

**Total Time:** ~30 minutes

## Support Checklist

Before going live:
- [ ] Read ENHANCED_ACTIVITY_SUMMARY_README.md
- [ ] Run all tests
- [ ] Test in multiple browsers
- [ ] Verify API endpoints
- [ ] Check mobile experience
- [ ] Review accessibility
- [ ] Update team documentation

## Questions?

Check these resources:
1. `ENHANCED_ACTIVITY_SUMMARY_README.md` - Full documentation
2. `QUICK_REFERENCE.md` - Quick tips
3. Test files - Usage examples
4. Component source - Implementation details

## Success Criteria

Your migration is successful when:
- ✅ All old features still work
- ✅ New features are accessible
- ✅ No console errors
- ✅ Tests pass
- ✅ Performance is acceptable
- ✅ Users can navigate easily

## Next Steps After Migration

1. Train team on new features
2. Update user documentation
3. Monitor for issues
4. Gather user feedback
5. Plan future enhancements

Good luck with your migration! 🚀
