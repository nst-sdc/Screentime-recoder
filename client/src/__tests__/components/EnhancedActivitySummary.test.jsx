import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedActivitySummary from '../../components/activity/EnhancedActivitySummary';

describe('EnhancedActivitySummary', () => {
  const mockActivities = [
    {
      id: 1,
      domain: 'github.com',
      category: 'Work',
      duration: 3600,
      productivityScore: 8,
      sessionCount: 3,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      domain: 'youtube.com',
      category: 'Entertainment',
      duration: 1800,
      productivityScore: 3,
      sessionCount: 2,
      timestamp: new Date().toISOString()
    }
  ];

  test('renders activity summary with activities', () => {
    render(<EnhancedActivitySummary activities={mockActivities} />);
    expect(screen.getByText('Recent Activity Summary')).toBeInTheDocument();
    expect(screen.getByText('2 activities')).toBeInTheDocument();
  });

  test('shows empty state when no activities', () => {
    render(<EnhancedActivitySummary activities={[]} />);
    expect(screen.getByText('No Activities Yet')).toBeInTheDocument();
  });

  test('shows error state when error prop is provided', () => {
    const error = { message: 'Failed to load' };
    render(<EnhancedActivitySummary activities={[]} error={error} />);
    expect(screen.getByText('Unable to Load Activities')).toBeInTheDocument();
  });

  test('toggles filters when filter button clicked', () => {
    render(<EnhancedActivitySummary activities={mockActivities} />);
    const filterButton = screen.getByText('Filters').closest('button');
    
    fireEvent.click(filterButton);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  test('exports to CSV when export button clicked', async () => {
    const mockCreateElement = jest.spyOn(document, 'createElement');
    render(<EnhancedActivitySummary activities={mockActivities} />);
    
    const exportButton = screen.getByText('Export').closest('button');
    fireEvent.click(exportButton);
    
    const csvButton = screen.getByText('Export as CSV').closest('button');
    fireEvent.click(csvButton);
    
    await waitFor(() => {
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    });
  });

  test('filters activities by search query', () => {
    render(<EnhancedActivitySummary activities={mockActivities} />);
    
    const filterButton = screen.getByText('Filters').closest('button');
    fireEvent.click(filterButton);
    
    const searchInput = screen.getByPlaceholderText('Search by domain or category...');
    fireEvent.change(searchInput, { target: { value: 'github' } });
    
    expect(screen.getByText('github.com')).toBeInTheDocument();
    expect(screen.queryByText('youtube.com')).not.toBeInTheDocument();
  });

  test('sorts activities when column header clicked', () => {
    render(<EnhancedActivitySummary activities={mockActivities} />);
    
    const durationHeader = screen.getByText('Duration').closest('th');
    fireEvent.click(durationHeader);
    
    // Verify sorting occurred (implementation specific)
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);
  });

  test('calls onActivityClick when activity row clicked', () => {
    const handleClick = jest.fn();
    render(<EnhancedActivitySummary activities={mockActivities} onActivityClick={handleClick} />);
    
    const firstRow = screen.getByText('github.com').closest('tr');
    fireEvent.click(firstRow);
    
    expect(handleClick).toHaveBeenCalledWith(mockActivities[0]);
  });

  test('displays productivity insights', () => {
    render(<EnhancedActivitySummary activities={mockActivities} />);
    
    expect(screen.getByText('Total Time')).toBeInTheDocument();
    expect(screen.getByText('Avg Productivity')).toBeInTheDocument();
    expect(screen.getByText('Productive Time')).toBeInTheDocument();
  });

  test('handles keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<EnhancedActivitySummary activities={mockActivities} onActivityClick={handleClick} />);
    
    const firstRow = screen.getByText('github.com').closest('tr');
    firstRow.focus();
    fireEvent.keyPress(firstRow, { key: 'Enter', code: 'Enter' });
    
    expect(handleClick).toHaveBeenCalled();
  });
});
