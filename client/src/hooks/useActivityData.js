import { useState, useEffect, useCallback } from 'react';

const useActivityData = (initialActivities = []) => {
  const [activities, setActivities] = useState(initialActivities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      setError(err);
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshActivities = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (initialActivities.length === 0) {
      fetchActivities();
    }
  }, [fetchActivities, initialActivities.length]);

  return {
    activities,
    loading,
    error,
    refreshActivities
  };
};

export default useActivityData;
