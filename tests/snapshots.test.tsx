import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { CommunityBenchmarking } from '../src/components/CommunityBenchmarking.jsx';
import { ImpactSimulator } from '../src/components/ImpactSimulator.jsx';
import { EcoChallenges } from '../src/components/EcoChallenges.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    getBenchmark: vi.fn(),
    simulate: vi.fn(),
    listChallenges: vi.fn(),
    completeChallenge: vi.fn()
  }
}));

describe('Frontend Component Snapshot Verification', () => {
  it('matches snapshot for CommunityBenchmarking', async () => {
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

    const { container } = render(<CommunityBenchmarking />);
    
    // Wait for the async benchmarking data to load in the component
    await waitFor(() => {
      expect(container.textContent).toContain('Emissions Benchmarking');
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for ImpactSimulator', async () => {
    vi.mocked(api.simulate).mockResolvedValue({
      baseline: { transport: 100, food: 100, energy: 100, lifestyle: 100, total: 400, score: 50 },
      projected: { transport: 80, food: 90, energy: 70, lifestyle: 85, total: 325, score: 65 },
      monthlyReduction: 75,
      annualReduction: 900
    } as any);

    const { container } = render(<ImpactSimulator />);

    // Wait for initial mount simulation calculation to run
    await waitFor(() => {
      expect(api.simulate).toHaveBeenCalledTimes(1);
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for EcoChallenges', async () => {
    const mockChallenges = [
      {
        id: 'chal-1',
        title: 'Meatless Monday',
        description: 'Skip meat for today.',
        points: 50,
        category: 'Food',
        difficulty: 'Easy',
        completed: false
      },
      {
        id: 'chal-2',
        title: 'Commute by Train',
        description: 'Take train instead of driving.',
        points: 100,
        category: 'Transportation',
        difficulty: 'Medium',
        completed: true
      }
    ];
    vi.mocked(api.listChallenges).mockResolvedValue(mockChallenges as any);

    const { container } = render(<EcoChallenges onChallengeCompleted={vi.fn()} />);

    // Wait for the mock challenges to load into the UI
    await waitFor(() => {
      expect(container.textContent).toContain('Meatless Monday');
    });

    expect(container).toMatchSnapshot();
  });
});
