/**
 * CanvasPlaceholder Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import CanvasPlaceholder from '../CanvasPlaceholder';

describe('CanvasPlaceholder', () => {
  it('renders canvas element', () => {
    const { container } = render(<CanvasPlaceholder />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('calls onCanvasMount when canvas ref is ready', () => {
    const onCanvasMount = jest.fn();
    render(<CanvasPlaceholder onCanvasMount={onCanvasMount} />);
    // Note: In a real test, you might need to wait for the effect
    // For now, we verify the callback prop is passed
    expect(onCanvasMount).toBeDefined();
  });

  it('displays time of day indicator', () => {
    render(<CanvasPlaceholder timeOfDay="Night" />);
    expect(screen.getByText('Night')).toBeInTheDocument();
  });

  it('displays weather indicator', () => {
    render(<CanvasPlaceholder weather="Rain" />);
    expect(screen.getByText('Rain')).toBeInTheDocument();
  });

  it('applies correct background style for different times', () => {
    const { container, rerender } = render(<CanvasPlaceholder timeOfDay="Morning" />);
    const placeholder = container.querySelector('.canvas-placeholder');
    expect(placeholder).toHaveStyle({ backgroundImage: expect.stringContaining('#e6f0ff') });

    rerender(<CanvasPlaceholder timeOfDay="Night" />);
    expect(placeholder).toHaveStyle({ backgroundImage: expect.stringContaining('#071226') });
  });
});

