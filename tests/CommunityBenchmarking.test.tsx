import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CommunityBenchmarking } from '../src/components/CommunityBenchmarking.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    getBenchmark: vi.fn()
  }
}));

describe('CommunityBenchmarking Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading states correctly', () => {
    vi.mocked(api.getBenchmark).mockReturnValue(new Promise(() => {}));
    render(<CommunityBenchmarking />);
    expect(screen.getByText('Calculating benchmark baselines...')).toBeDefined();
  });

  it('renders error state on API failure', async () => {
    vi.mocked(api.getBenchmark).mockRejectedValue(new Error('Benchmarking API failure.'));
    render(<CommunityBenchmarking />);

    await waitFor(() => {
      expect(screen.getByText('Benchmarking API failure.')).toBeDefined();
    });
  });

  it('renders comparisons and leaderboard elements successfully on success', async () => {
    const mockBenchmarkData = {
      userFootprint: 150,
      personaAverage: 120,
      regionalAverage: 160,
      globalAverage: 240,
      comparisons: [
        { label: 'Average Student', value: 120, percentageDifference: 25 },
        { label: 'Regional Average (India)', value: 160, percentageDifference: -6.3 }
      ],
      communitySavings: 14500,
      ranking: 2,
      totalUsers: 5,
      leaderboard: [
        { name: 'Eco-Hero (Rank 1)', score: 95, footprint: 80 },
        { name: 'Judge Tester (You)', score: 88, footprint: 150 },
        { name: 'Professional (Rank 3)', score: 60, footprint: 400 }
      ]
    };

    vi.mocked(api.getBenchmark).mockResolvedValue(mockBenchmarkData as any);

    render(<CommunityBenchmarking />);

    await waitFor(() => {
      expect(screen.getByText('Emissions Benchmarking')).toBeDefined();
      expect(screen.getByText('150 kg CO₂ / month')).toBeDefined();
      expect(screen.getByText('Average Student')).toBeDefined();
      expect(screen.getByText('14500 kg')).toBeDefined(); // Community savings
      expect(screen.getByText('#2')).toBeDefined(); // Rank
      expect(screen.getByText('of 5 users')).toBeDefined();
      expect(screen.getByText('Platform Leaderboard')).toBeDefined();
      expect(screen.getByText('Judge Tester (You)')).toBeDefined();
    });

    // Check SVG screen reader label
    const srLabel = screen.getByText(/Benchmarking details table:/i);
    expect(srLabel).toBeDefined();
    expect(srLabel.className).toContain('sr-only');
  });
});
