/**
 * TrackCard Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TrackCard from '../TrackCard';

const mockTrack = {
  id: 'test-track',
  name: 'Test Track',
  img: '/test-track.svg',
  country: 'Test Country',
  location: 'Test Location',
  length: '5.0 km',
  turns: 15,
  bestLapSeconds: 90.5,
  laps: 50,
};

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TrackCard', () => {
  it('renders track information', () => {
    renderWithRouter(<TrackCard track={mockTrack} />);
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('displays track stats', () => {
    renderWithRouter(<TrackCard track={mockTrack} />);
    expect(screen.getByText('5.0 km')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders simulate button', () => {
    renderWithRouter(<TrackCard track={mockTrack} />);
    expect(screen.getByRole('button', { name: /simulate/i })).toBeInTheDocument();
  });

  it('calls onSimulate when provided', () => {
    const mockOnSimulate = jest.fn();
    renderWithRouter(<TrackCard track={mockTrack} onSimulate={mockOnSimulate} />);
    
    const button = screen.getByRole('button', { name: /simulate/i });
    button.click();
    
    expect(mockOnSimulate).toHaveBeenCalledWith(mockTrack);
  });
});

