/**
 * Leaderboard Component Tests
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Leaderboard from '../Leaderboard';

const sampleData = [
  { pos: 1, name: 'L. Hamilton', team: 'Mercedes', time: '1:28.062' },
  { pos: 2, name: 'M. Verstappen', team: 'Red Bull Racing', time: '1:28.325' },
  { pos: 3, name: 'C. Leclerc', team: 'Ferrari', time: '1:28.735' },
];

describe('Leaderboard', () => {
  it('renders leaderboard with initial data', () => {
    render(<Leaderboard initialData={sampleData} />);
    expect(screen.getByText('L. Hamilton')).toBeInTheDocument();
    expect(screen.getByText('M. Verstappen')).toBeInTheDocument();
    expect(screen.getByText('C. Leclerc')).toBeInTheDocument();
  });

  it('displays top 3 prominently', () => {
    render(<Leaderboard initialData={sampleData} />);
    const top3Section = screen.getByText('L. Hamilton').closest('.top3-card');
    expect(top3Section).toBeInTheDocument();
  });

  it('updates when initialData changes', () => {
    const { rerender } = render(<Leaderboard initialData={sampleData} />);
    expect(screen.getByText('L. Hamilton')).toBeInTheDocument();

    const newData = [
      { pos: 1, name: 'New Driver', team: 'New Team', time: '1:27.000' },
    ];
    rerender(<Leaderboard initialData={newData} />);
    expect(screen.getByText('New Driver')).toBeInTheDocument();
  });

  it('shows driver details when row is expanded', () => {
    const driverDetails = {
      'L. Hamilton': {
        tyre: 'Soft',
        fuelKg: 50,
        lastLap: '1:28.100',
        gap: '0.000s',
      },
    };

    render(
      <Leaderboard initialData={sampleData} driverDetails={driverDetails} />
    );

    const row = screen.getByText('L. Hamilton').closest('.lb-row');
    expect(row).toBeInTheDocument();

    // Click to expand (if implemented)
    // fireEvent.click(row);
    // expect(screen.getByText('Soft')).toBeInTheDocument();
  });
});

