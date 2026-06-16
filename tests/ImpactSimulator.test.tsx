import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ImpactSimulator } from '../src/components/ImpactSimulator.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    simulate: vi.fn()
  }
}));

describe('ImpactSimulator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders simulation inputs and placeholders initially', async () => {
    // API mock resolving immediately
    vi.mocked(api.simulate).mockResolvedValue({
      baseline: { transport: 100, food: 100, energy: 100, lifestyle: 100, total: 400, score: 50 },
      projected: { transport: 100, food: 100, energy: 100, lifestyle: 100, total: 400, score: 50 },
      monthlyReduction: 0,
      annualReduction: 0
    } as any);

    render(<ImpactSimulator />);

    expect(screen.getByText('Impact Simulation Controls')).toBeDefined();
    expect(screen.getByText('Switch to Public Transit')).toBeDefined();
    expect(screen.getByText('Reduce Electricity usage')).toBeDefined();
    expect(screen.getByLabelText('Transition Diet')).toBeDefined();
    expect(screen.getByLabelText('Shopping Habits')).toBeDefined();

    // Wait for the debounced initial call
    await waitFor(() => {
      expect(api.simulate).toHaveBeenCalledTimes(1);
    });
  });

  it('triggers debounced simulation requests upon state adjustments', async () => {
    const mockSimResult = {
      baseline: { transport: 100, food: 80, energy: 90, lifestyle: 70, total: 340, score: 62 },
      projected: { transport: 30, food: 80, energy: 90, lifestyle: 70, total: 270, score: 75 },
      monthlyReduction: 70,
      annualReduction: 840
    };

    vi.mocked(api.simulate).mockResolvedValue(mockSimResult as any);

    render(<ImpactSimulator />);

    // Wait for initial mount call
    await waitFor(() => {
      expect(api.simulate).toHaveBeenCalledTimes(1);
    });
    vi.clearAllMocks();

    // Toggle transit checkbox
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Verify API is not called immediately due to debounce
    expect(api.simulate).not.toHaveBeenCalled();

    // Wait for debounce duration (> 250ms)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    await waitFor(() => {
      expect(api.simulate).toHaveBeenCalledTimes(1);
      expect(api.simulate).toHaveBeenCalledWith({
        switchTransit: true,
        reduceElectricityPct: 0,
        newDietType: '',
        newShoppingHabits: ''
      });
    });

    // Check display outputs
    expect(screen.getByText(/^\s*70\s*kg\s*$/)).toBeDefined();
    expect(screen.getByText(/^\s*840\s*kg\s*$/)).toBeDefined();
    expect(screen.getByText('Projected Emission Savings')).toBeDefined();
  });

  it('handles loading state during simulation runtime', async () => {
    // Return a promise that doesn't resolve to keep it in loading state
    vi.mocked(api.simulate).mockReturnValue(new Promise(() => {}));
    
    render(<ImpactSimulator />);

    // Wait a tiny bit for the debounce delay to kick in the loading state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    expect(screen.getByText('Calculating simulation parameters...')).toBeDefined();
  });

  it('displays API simulation error banners gracefully on failure', async () => {
    vi.mocked(api.simulate).mockRejectedValue(new Error('Simulation failed due to engine crash.'));

    render(<ImpactSimulator />);

    await waitFor(() => {
      expect(screen.getByText('Simulation failed due to engine crash.')).toBeDefined();
    });
  });
});
