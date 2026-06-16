import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CarbonCalculator } from '../src/components/CarbonCalculator.jsx';
import { api } from '../src/services/api.js';

// Mock the API service
vi.mock('../src/services/api.js', () => ({
  api: {
    calculate: vi.fn()
  }
}));

describe('CarbonCalculator Component', () => {
  const mockOnCalculationCompleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input elements and initial default state correctly', () => {
    render(
      <CarbonCalculator
        onCalculationCompleted={mockOnCalculationCompleted}
        initialPersona="Student"
      />
    );

    // Assert headers and labels are visible
    expect(screen.getByText('Input Footprint Parameters')).toBeDefined();
    expect(screen.getByLabelText('User Persona')).toBeDefined();
    expect(screen.getByLabelText('Commute Method')).toBeDefined();
    expect(screen.getByLabelText('Daily Distance (km)')).toBeDefined();

    // Check that default values are set
    const personaSelect = screen.getByLabelText('User Persona') as HTMLSelectElement;
    expect(personaSelect.value).toBe('Student');
  });

  it('handles user form inputs and triggers calculate API successfully', async () => {
    const mockResult = {
      id: 'calc-123',
      timestamp: '2026-06-16T12:00:00Z',
      persona: 'Student',
      inputs: {
        persona: 'Student',
        transportMethod: 'ev',
        dailyDistance: 20,
        dietType: 'vegan',
        electricityUsage: 100,
        electricityType: 'green',
        shoppingHabits: 'low'
      },
      transportEmissions: 10,
      foodEmissions: 20,
      energyEmissions: 5,
      lifestyleEmissions: 15,
      totalEmissions: 50,
      carbonScore: 88,
      classification: 'Low'
    };

    vi.mocked(api.calculate).mockResolvedValue(mockResult as any);

    render(
      <CarbonCalculator
        onCalculationCompleted={mockOnCalculationCompleted}
        initialPersona="Student"
      />
    );

    // Alter Commute Distance Input
    const distanceInput = screen.getByLabelText('Daily Distance (km)') as HTMLInputElement;
    fireEvent.change(distanceInput, { target: { value: '20' } });
    expect(distanceInput.value).toBe('20');

    // Alter diet type
    const dietSelect = screen.getByLabelText('Diet Pattern') as HTMLSelectElement;
    fireEvent.change(dietSelect, { target: { value: 'vegan' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Calculate Footprint/i });
    fireEvent.click(submitButton);

    // Wait for mock calculation response
    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledTimes(1);
      expect(mockOnCalculationCompleted).toHaveBeenCalledWith(mockResult);
    });

    // Check that the results card is shown in the DOM
    expect(screen.getByText('Footprint Calculation Results')).toBeDefined();
    expect(screen.getByText('88')).toBeDefined(); // Carbon score display
    expect(screen.getByText('50')).toBeDefined(); // Total emissions display
  });

  it('displays API error messages gracefully on failure', async () => {
    vi.mocked(api.calculate).mockRejectedValue(new Error('Network calculation error. Please try again.'));

    render(
      <CarbonCalculator
        onCalculationCompleted={mockOnCalculationCompleted}
        initialPersona="Student"
      />
    );

    const submitButton = screen.getByRole('button', { name: /Calculate Footprint/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Network calculation error. Please try again.')).toBeDefined();
    });
  });
});
