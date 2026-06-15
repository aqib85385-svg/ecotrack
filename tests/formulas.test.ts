import { describe, it, expect } from 'vitest';
import { calculateFootprint, EMISSION_FACTORS } from '../shared/formulas.js';
import { CalculationInput } from '../shared/types.js';

describe('Carbon Footprint Formulas', () => {
  it('correctly calculates transportation emissions', () => {
    const input: CalculationInput = {
      persona: 'Student',
      transportMethod: 'petrol_car',
      dailyDistance: 10, // 10 km * 0.18 * 30 days = 54 kg
      dietType: 'vegan', // 45 kg
      electricityUsage: 0,
      electricityType: 'grid',
      shoppingHabits: 'low' // 30 kg
    };
    const res = calculateFootprint(input);
    expect(res.transportEmissions).toBe(54);
    expect(res.foodEmissions).toBe(45);
    expect(res.energyEmissions).toBe(0);
    expect(res.lifestyleEmissions).toBe(30);
    expect(res.totalEmissions).toBe(129);
  });

  it('handles walking and cycling correctly with 0 emissions', () => {
    const input: CalculationInput = {
      persona: 'Student',
      transportMethod: 'walk_cycle',
      dailyDistance: 100, // 0 emissions
      dietType: 'vegan', // 45 kg
      electricityUsage: 100, // 100 * 0.4 = 40 kg
      electricityType: 'grid',
      shoppingHabits: 'low' // 30 kg
    };
    const res = calculateFootprint(input);
    expect(res.transportEmissions).toBe(0);
    expect(res.totalEmissions).toBe(115);
    expect(res.classification).toBe('Low');
  });

  it('correctly shifts classification based on totals', () => {
    // High footprint
    const inputHigh: CalculationInput = {
      persona: 'Professional',
      transportMethod: 'petrol_car',
      dailyDistance: 100, // 100 * 0.18 * 30 = 540 kg
      dietType: 'omnivore', // 99 kg
      electricityUsage: 300, // 300 * 0.4 = 120 kg
      electricityType: 'grid',
      shoppingHabits: 'high' // 150 kg
    };
    const res = calculateFootprint(inputHigh);
    expect(res.totalEmissions).toBe(909);
    expect(res.classification).toBe('High');
  });
});
