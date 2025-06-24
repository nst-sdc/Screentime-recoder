import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const data = {
    labels: ['Productivity', 'Entertainment', 'Social'],
    datasets: [
      {
        label: 'Usage (minutes)',
        data: [153, 7, 2],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Screen Time Breakdown' },
    },
  };

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>Dashboard</h1>
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <Bar data={data} options={options} />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{
          background: '#333',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>Users</h2>
          <p>100</p>
        </div>
        <div style={{
          background: '#333',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>Active Time</h2>
          <p>5 hours</p>
        </div>
        <div style={{
          background: '#333',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>Screen Time Alerts</h2>
          <p>3 Sent</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;