/**
 * ParamsSidebar Component Tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ParamsSidebar from '../ParamsSidebar';

const defaultParams = {
  sessionType: 'Qualifying',
  timeOfDay: 'Midday',
  weather: 'Clear',
  regulation: '2026',
  tyreCompound: 'soft',
  fuelKg: 50,
  runMinutes: 10,
  ambientTemp: 22,
  trackTemp: 28,
  gripLevel: 85,
  windSpeed: 8,
  tyrePressure: 22,
  pitStrategy: 'One-stop',
  trafficDensity: 'Medium',
  aiDifficulty: 'Normal',
  safetyCarProb: 8,
};

describe('ParamsSidebar', () => {
  const mockOnParamsChange = jest.fn();
  const mockOnStartStop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('renders all parameter inputs', () => {
    render(
      <ParamsSidebar
        params={defaultParams}
        onParamsChange={mockOnParamsChange}
        isRunning={false}
        onStartStop={mockOnStartStop}
      />
    );

    expect(screen.getByLabelText(/session type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of day/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weather/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/regulation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fuel/i)).toBeInTheDocument();
  });

  it('calls onParamsChange when a parameter is changed', () => {
    render(
      <ParamsSidebar
        params={defaultParams}
        onParamsChange={mockOnParamsChange}
        isRunning={false}
        onStartStop={mockOnStartStop}
      />
    );

    const sessionSelect = screen.getByLabelText(/session type/i);
    fireEvent.change(sessionSelect, { target: { value: 'Race' } });

    expect(mockOnParamsChange).toHaveBeenCalled();
    const updatedParams = mockOnParamsChange.mock.calls[0][0];
    expect(updatedParams.sessionType).toBe('Race');
  });

  it('persists regulation to localStorage', () => {
    render(
      <ParamsSidebar
        params={defaultParams}
        onParamsChange={mockOnParamsChange}
        isRunning={false}
        onStartStop={mockOnStartStop}
      />
    );

    const regulationSelect = screen.getByLabelText(/regulation/i);
    fireEvent.change(regulationSelect, { target: { value: '2022' } });

    expect(localStorage.getItem('rl_selected_reg')).toBe('2022');
  });

  it('calls onStartStop when start/stop button is clicked', () => {
    render(
      <ParamsSidebar
        params={defaultParams}
        onParamsChange={mockOnParamsChange}
        isRunning={false}
        onStartStop={mockOnStartStop}
      />
    );

    const startButton = screen.getByRole('button', { name: /start simulation/i });
    fireEvent.click(startButton);

    expect(mockOnStartStop).toHaveBeenCalledTimes(1);
  });

  it('displays stop button when running', () => {
    render(
      <ParamsSidebar
        params={defaultParams}
        onParamsChange={mockOnParamsChange}
        isRunning={true}
        onStartStop={mockOnStartStop}
      />
    );

    expect(screen.getByRole('button', { name: /stop simulation/i })).toBeInTheDocument();
  });
});

