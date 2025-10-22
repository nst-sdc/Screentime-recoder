import React, { useEffect, useState } from 'react';
import ActivityHeatmap from '../components/charts/ActivityHeatmap';
import { fetchActivities } from '../services/dashboardService';

/**
 * Example integration of Activity Heatmap
 */
const HeatmapExample = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await fetchActivities();
      setActivities(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (cell) => {
    console.log('Cell clicked:', cell);
    // You can implement custom behavior here
    // e.g., show a modal with detailed activities
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error loading activities</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={loadActivities}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <ActivityHeatmap 
        activities={activities}
        onCellClick={handleCellClick}
      />
    </div>
  );
};

export default HeatmapExample;
