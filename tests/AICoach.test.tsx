import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AICoach } from '../src/components/AICoach.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    getRecommendations: vi.fn(),
    getReports: vi.fn(),
    generateReport: vi.fn()
  }
}));

describe('AICoach Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading states correctly when recommendations fetch is in progress', () => {
    vi.mocked(api.getRecommendations).mockReturnValue(new Promise(() => {}));
    vi.mocked(api.getReports).mockResolvedValue([]);

    render(<AICoach />);

    expect(screen.getByText('Running Action Prioritization Engine...')).toBeDefined();
  });

  it('renders prioritizations when api resolves recommendations successfully', async () => {
    const mockRecommendations = [
      {
        id: 'rec-1',
        action: 'Switch to public transport',
        category: 'Transportation',
        annualCo2Savings: 500,
        annualSavings: 15000,
        difficulty: 'Low',
        roi: 'High',
        priorityScore: 92,
        reason: 'Slashes emissions immediately.'
      }
    ];

    vi.mocked(api.getRecommendations).mockResolvedValue(mockRecommendations as any);
    vi.mocked(api.getReports).mockResolvedValue([]);

    render(<AICoach />);

    await waitFor(() => {
      expect(screen.getByText('AI Action Engine Prioritization')).toBeDefined();
      expect(screen.getByText('Switch to public transport')).toBeDefined();
      expect(screen.getByText('92/100')).toBeDefined();
      expect(screen.getByText('Slashes emissions immediately.')).toBeDefined();
    });
  });

  it('handles and triggers report generation successfully upon button click', async () => {
    vi.mocked(api.getRecommendations).mockResolvedValue([]);
    vi.mocked(api.getReports).mockResolvedValue([]);

    const mockReport = {
      id: 'rep-1',
      timestamp: '2026-06-16T12:00:00Z',
      sustainabilityScore: 78,
      riskLevel: 'Low',
      trends: 'Improving',
      bestImprovement: 'Solar power transition',
      biggestConcern: 'Car usage',
      topRecommendation: 'EV conversion',
      carbonTwinProjections: 'Steady cuts expected.',
      formattedReport: 'AI strategy details here.'
    };

    vi.mocked(api.generateReport).mockResolvedValue(mockReport as any);

    render(<AICoach />);

    // Check report placeholder renders first
    expect(screen.getByText('No report generated yet.')).toBeDefined();

    // Click generate button
    const generateBtn = screen.getByRole('button', { name: /Generate Report/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(api.generateReport).toHaveBeenCalledTimes(1);
    });

    // Check that generated details are rendered in the DOM
    await waitFor(() => {
      expect(screen.getByText('BEST IMPROVEMENT')).toBeDefined();
      expect(screen.getByText('Solar power transition')).toBeDefined();
      expect(screen.getByText('BIGGEST CONCERN')).toBeDefined();
      expect(screen.getByText('Car usage')).toBeDefined();
      expect(screen.getByText('AI COACH STRATEGY INSIGHTS')).toBeDefined();
      expect(screen.getByText('AI strategy details here.')).toBeDefined();
      expect(screen.getByText('Forecast Projection:')).toBeDefined();
      expect(screen.getByText('Steady cuts expected.')).toBeDefined();
    });
  });
});
