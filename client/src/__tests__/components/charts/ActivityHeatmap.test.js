import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityHeatmap from '../../../components/charts/ActivityHeatmap';

describe('ActivityHeatmap', () => {
  const mockActivities = [
    {
      timestamp: '2025-10-23T10:00:00Z',
      duration: 30,
      category: 'Work'
    }
  ];

  test('renders without crashing', () => {
    render(<ActivityHeatmap activities={mockActivities} />);
    expect(screen.getByText('Activity Heatmap')).toBeInTheDocument();
  });

  test('renders time range buttons', () => {
    render(<ActivityHeatmap activities={mockActivities} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  test('handles time range selection', () => {
    render(<ActivityHeatmap activities={mockActivities} />);
    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);
    expect(todayButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('displays analytics', () => {
    render(<ActivityHeatmap activities={mockActivities} />);
    expect(screen.getByText('Peak Hour')).toBeInTheDocument();
    expect(screen.getByText('Consistency Score')).toBeInTheDocument();
  });
});
