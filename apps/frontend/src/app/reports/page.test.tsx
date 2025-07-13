import { render, screen } from '@testing-library/react';
import ReportsPage from './page';

// Mock the segment analytics module
jest.mock('../../lib/segment', () => ({
  getAnalytics: () => ({
    track: jest.fn(),
  }),
}));

describe('ReportsPage', () => {
  it('renders the reports page heading', () => {
    render(<ReportsPage />);
    expect(screen.getByRole('heading', { name: /Reports Page/i })).toBeInTheDocument();
  });
});
