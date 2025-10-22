import React, { useState, useEffect } from 'react';
import EnhancedActivitySummary from '../components/activity/EnhancedActivitySummary';
import '../components/activity/EnhancedActivitySummary.css';

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Fetch activities
      const activitiesResponse = await fetch('/api/activities/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!activitiesResponse.ok) {
        throw new Error('Failed to fetch activities');
      }

      const activitiesData = await activitiesResponse.json();

      // Fetch goals (if endpoint exists)
      let goalsData = [];
      try {
        const goalsResponse = await fetch('/api/goals', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (goalsResponse.ok) {
          const goalsResult = await goalsResponse.json();
          goalsData = goalsResult.goals || [];
        }
      } catch (err) {
        console.log('Goals endpoint not available:', err);
      }

      setActivities(activitiesData.activities || activitiesData || []);
      setGoals(goalsData);
    } catch (err) {
      setError(err);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity) => {
    console.log('Activity clicked:', activity);
    // Add navigation or modal logic here
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      <main className="dashboard-main">
        <EnhancedActivitySummary
          activities={activities}
          goals={goals}
          loading={loading}
          error={error}
          onActivityClick={handleActivityClick}
        />

        {/* Other dashboard components can be added here */}
      </main>
    </div>
  );
};

export default Dashboard;
