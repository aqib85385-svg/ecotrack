import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProgressTracker } from '../src/components/ProgressTracker.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    getHistory: vi.fn()
  }
}));

describe('ProgressTracker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading states correctly', () => {
    vi.mocked(api.getHistory).mockReturnValue(new Promise(() => {}));
    render(<ProgressTracker />);
    expect(screen.getByText('Retrieving history data...')).toBeDefined();
  });

  it('renders empty state when no calculations recorded', async () => {
    vi.mocked(api.getHistory).mockResolvedValue({
      history: [],
      stats: { points: 0, streak: 0, completedChallenges: [], unlockedAchievements: [] },
      risk: { level: 'Low', reason: 'No risk detected.', metrics: { trendSlope: 0, adoptionRate: 0, challengeRate: 0 } }
    } as any);

    render(<ProgressTracker />);
    await waitFor(() => {
      expect(screen.getByText('No calculations recorded.')).toBeDefined();
      expect(screen.getByText(/Submit your carbon calculations/)).toBeDefined();
    });
  });

  it('renders calculations trend, stats, and achievements badges on success', async () => {
    const mockData = {
      history: [
        {
          id: 'calc-1',
          timestamp: '2026-05-15T12:00:00.000Z',
          persona: 'Student',
          inputs: { dietType: 'vegan' },
          totalEmissions: 120.5,
          carbonScore: 82
        },
        {
          id: 'calc-2',
          timestamp: '2026-06-15T12:00:00.000Z',
          persona: 'Student',
          inputs: { dietType: 'vegan' },
          totalEmissions: 110.2,
          carbonScore: 85
        }
      ],
      stats: {
        points: 250,
        streak: 3,
        completedChallenges: ['chal-1'],
        unlockedAchievements: ['Green Starter', 'Eco Hero']
      },
      risk: {
        level: 'Low',
        reason: 'Consistently low student footprint.',
        metrics: { trendSlope: -10.3, adoptionRate: 80, challengeRate: 50 }
      }
    };

    vi.mocked(api.getHistory).mockResolvedValue(mockData as any);
    render(<ProgressTracker />);

    await waitFor(() => {
      expect(screen.getByText('Calculation History Trends')).toBeDefined();
      expect(screen.getByText('8.5% Reduction')).toBeDefined();
      expect(screen.getByText('Low Risk Profile')).toBeDefined();
      expect(screen.getByText('Consistently low student footprint.')).toBeDefined();
      expect(screen.getByText('3 Weeks')).toBeDefined();
      expect(screen.getByText('250 pts')).toBeDefined();
      expect(screen.getByText('Eco Expert')).toBeDefined(); // achievement Expert
    });

    // Check SVG attributes
    const svgElement = screen.getByRole('img', { name: 'Monthly carbon emission trends over time.' });
    expect(svgElement).toBeDefined();
  });

  it('renders error state on API failure', async () => {
    vi.mocked(api.getHistory).mockRejectedValue(new Error('History database is locked.'));
    render(<ProgressTracker />);

    await waitFor(() => {
      expect(screen.getByText('History database is locked.')).toBeDefined();
    });
  });
});
