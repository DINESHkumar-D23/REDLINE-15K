/**
 * Loading Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../Loading';

describe('Loading', () => {
  it('renders loading spinner', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('displays custom message', () => {
    render(<Loading message="Loading tracks..." />);
    expect(screen.getByText('Loading tracks...')).toBeInTheDocument();
  });

  it('renders with fullScreen class when fullScreen is true', () => {
    const { container } = render(<Loading fullScreen />);
    const loadingContainer = container.querySelector('.loading-container-fullscreen');
    expect(loadingContainer).toBeInTheDocument();
  });
});

