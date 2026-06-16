import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CarbonTwin } from '../src/components/CarbonTwin.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    getTwin: vi.fn()
  }
}));

describe('CarbonTwin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when model generation is active', () => {
    // Delay resolve to preserve loading state
    vi.mocked(api.getTwin).mockReturnValue(new Promise(() => {}));

    render(<CarbonTwin />);

    expect(screen.getByText('Generating Digital Carbon Twin model...')).toBeDefined();
  });

  it('renders error block on api rejection', async () => {
    vi.mocked(api.getTwin).mockRejectedValue(new Error('Database connectivity issues.'));

    render(<CarbonTwin />);

    await waitFor(() => {
      expect(screen.getByText('Database connectivity issues.')).toBeDefined();
    });
  });

  it('renders uninitialized card message when there is no historical data', async () => {
    vi.mocked(api.getTwin).mockResolvedValue({
      currentEmissions: 0,
      forecast: [],
      confidence: 'Low',
      confidenceReason: 'No data to forecast'
    } as any);

    render(<CarbonTwin />);

    await waitFor(() => {
      expect(screen.getByText('Twin model uninitialized.')).toBeDefined();
      expect(screen.getByText('Submit calculations to start modeling forecasts.')).toBeDefined();
    });
  });

  it('renders predictive paths chart and confidence metrics on success', async () => {
    const mockTwinData = {
      currentEmissions: 200,
      forecast: [
        { month: 'Jul 2026', baseline: 200, recommended: 180, optimized: 160 },
        { month: 'Aug 2026', baseline: 200, recommended: 160, optimized: 140 },
        { month: 'Sep 2026', baseline: 200, recommended: 140, optimized: 120 }
      ],
      confidence: 'High',
      confidenceReason: 'Active logging history indicates consistent habits.'
    };

    vi.mocked(api.getTwin).mockResolvedValue(mockTwinData as any);

    render(<CarbonTwin />);

    await waitFor(() => {
      expect(screen.getByText('Predictive Emission Pathways (Carbon Twin 3.0)')).toBeDefined();
      expect(screen.getByText('Forecast Confidence')).toBeDefined();
      expect(screen.getByText('High')).toBeDefined();
      expect(screen.getByText('Active logging history indicates consistent habits.')).toBeDefined();
    });

    // Check SVG chart elements render
    const chart = screen.getByRole('img', { name: /Carbon Twin Forecast Chart/i });
    expect(chart).toBeDefined();

    // Check table headers and content
    expect(screen.getByText('Timeline')).toBeDefined();
    expect(screen.getByText('Jul 2026')).toBeDefined();
    expect(screen.getAllByText('200')).toHaveLength(6); // Current baseline/recommended/optimized, and Jul/Aug/Sep baselines
  });
});
