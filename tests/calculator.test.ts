import { describe, it, expect } from 'vitest';
import { safetyGateway } from '../server/services/safetyGateway.js';
import { CalculationInput } from '../shared/types.js';

describe('Calculator Input Boundary Validation', () => {
  it('passes for valid calculation parameters', () => {
    const inputs: CalculationInput = {
      persona: 'Student',
      transportMethod: 'ev',
      dailyDistance: 15,
      dietType: 'vegan',
      electricityUsage: 120,
      electricityType: 'green',
      shoppingHabits: 'low'
    };
    
    const validated = safetyGateway.validateAndSanitizeInputs(inputs);
    expect(validated.dailyDistance).toBe(15);
    expect(validated.electricityUsage).toBe(120);
  });

  it('rejects extremely large distance parameters', () => {
    const inputs: CalculationInput = {
      persona: 'Student',
      transportMethod: 'ev',
      dailyDistance: 999999, // out of bounds
      dietType: 'vegan',
      electricityUsage: 120,
      electricityType: 'green',
      shoppingHabits: 'low'
    };
    
    expect(() => safetyGateway.validateAndSanitizeInputs(inputs)).toThrow();
  });

  it('rejects negative electricity usage parameters', () => {
    const inputs: CalculationInput = {
      persona: 'Student',
      transportMethod: 'ev',
      dailyDistance: 15,
      dietType: 'vegan',
      electricityUsage: -10, // out of bounds
      electricityType: 'green',
      shoppingHabits: 'low'
    };
    
    expect(() => safetyGateway.validateAndSanitizeInputs(inputs)).toThrow();
  });
});
