import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScenarioPlanner } from '../src/components/ScenarioPlanner.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    generatePlan: vi.fn()
  }
}));

describe('ScenarioPlanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial uninitialized state correctly', () => {
    render(<ScenarioPlanner />);

    expect(screen.getByText('Sustainability Target')).toBeDefined();
    expect(screen.getByText('No active roadmap generated.')).toBeDefined();
    
    // Check that radio buttons exist
    const radio10 = screen.getByLabelText(/Reduce emissions by 10%/i);
    expect(radio10).toBeDefined();
    expect((radio10 as HTMLInputElement).checked).toBe(true);
  });

  it('changes selected goal type upon radio click', () => {
    render(<ScenarioPlanner />);

    const radio25 = screen.getByLabelText(/Reduce emissions by 25%/i) as HTMLInputElement;
    expect(radio25.checked).toBe(false);

    fireEvent.click(radio25);
    expect(radio25.checked).toBe(true);
  });

  it('submits selected goal and displays synthesized roadmap milestones on success', async () => {
    const mockPlan = {
      goalType: 'reduction_10',
      targetDate: 'September 2026',
      monthlySavingsGoal: 830,
      monthlyCo2ReductionGoal: 22,
      totalCo2Reduction: 264,
      totalSavings: 10000,
      probability: 85,
      timeRequired: '3 Months',
      roadmap: [
        {
          month: 1,
          actions: ['Switch 100% lighting to LEDs', 'Reduce HVAC usage by 1 hour/day'],
          monthlyCo2Reduction: 12,
          monthlySavings: 450
        },
        {
          month: 2,
          actions: ['Commit to Meatless Mondays', 'Unplug idle electronics'],
          monthlyCo2Reduction: 22,
          monthlySavings: 830
        }
      ]
    };

    vi.mocked(api.generatePlan).mockResolvedValue(mockPlan as any);

    render(<ScenarioPlanner />);

    const generateBtn = screen.getByRole('button', { name: /Generate Action Roadmap/i });
    fireEvent.click(generateBtn);

    // Assert API triggered
    await waitFor(() => {
      expect(api.generatePlan).toHaveBeenCalledTimes(1);
      expect(api.generatePlan).toHaveBeenCalledWith('reduction_10');
    });

    // Assert generated roadmap details display in the DOM
    expect(screen.getByText('264 kg/yr')).toBeDefined();
    expect(screen.getByText('₹10,000/yr')).toBeDefined();
    expect(screen.getByText('85%')).toBeDefined();
    expect(screen.getByText('Month 1 Milestone')).toBeDefined();
    expect(screen.getByText('Switch 100% lighting to LEDs')).toBeDefined();
    expect(screen.getByText('Month 2 Milestone')).toBeDefined();
  });

  it('handles and displays API error messages gracefully on failure', async () => {
    vi.mocked(api.generatePlan).mockRejectedValue(new Error('Failed to compute scenario calculations.'));

    render(<ScenarioPlanner />);

    const generateBtn = screen.getByRole('button', { name: /Generate Action Roadmap/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(api.generatePlan).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Failed to compute scenario calculations.')).toBeDefined();
    });
  });
});
