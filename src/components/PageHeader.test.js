import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageHeader from './PageHeader';

// Mock any dependencies if needed
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

describe('PageHeader Component', () => {
  it('renders the title correctly', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <PageHeader title="Test Title">
        <button>Test Button</button>
      </PageHeader>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('does not render children when not provided', () => {
    const { container } = render(<PageHeader title="Test Title" />);
    // Check that the actions div is empty or not present
    const actionsDiv = container.querySelector('.actions');
    expect(actionsDiv).toBeFalsy();
  });
});
