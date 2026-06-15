import { describe, it, expect } from 'vitest';
import { carbonTwinService } from '../server/services/carbonTwinService.js';
import { CalculationResult } from '../shared/types.js';

describe('Carbon Twin Forecasting Model', () => {
  it('assigns Low confidence when history contains only 1 entry', () => {
    const history: CalculationResult[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        persona: 'Student',
        inputs: {} as any,
        transportEmissions: 10,
        foodEmissions: 10,
        energyEmissions: 10,
        lifestyleEmissions: 10,
        totalEmissions: 40,
        carbonScore: 90,
        classification: 'Low'
      }
    ];

    const twin = carbonTwinService.generateForecast(history);
    expect(twin.confidence).toBe('Low');
    expect(twin.forecast.length).toBe(3); // 1, 6, 12 months
  });

  it('correctly models flat baseline projections on low variance', () => {
    // stable logs over time
    const baseDate = new Date();
    const history: CalculationResult[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `calc-${i}`,
      timestamp: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i * 15).toISOString(),
      persona: 'Student',
      inputs: {} as any,
      transportEmissions: 10,
      foodEmissions: 10,
      energyEmissions: 10,
      lifestyleEmissions: 10,
      totalEmissions: 100, // completely stable
      carbonScore: 90,
      classification: 'Low'
    }));

    const twin = carbonTwinService.generateForecast(history);
    expect(twin.confidence).toBe('High');
    // forecast baseline should be close to 100
    expect(twin.forecast[0].baseline).toBeCloseTo(100, 0);
  });
});
