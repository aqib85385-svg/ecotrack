import type { CalculationInput, CalculationResult } from './types.js';

export const EMISSION_FACTORS = {
  transport: {
    petrol_car: 0.18,      // kg CO2 / km
    diesel_car: 0.17,      // kg CO2 / km
    ev: 0.05,              // kg CO2 / km
    public_transit: 0.04,  // kg CO2 / km
    walk_cycle: 0.00       // kg CO2 / km
  },
  diet: {
    omnivore: 99,         // kg CO2 / month
    average_meat: 75,     // kg CO2 / month
    pescatarian: 60,      // kg CO2 / month
    vegetarian: 51,       // kg CO2 / month
    vegan: 45             // kg CO2 / month
  },
  electricity: {
    grid: 0.40,           // kg CO2 / kWh
    green: 0.02           // kg CO2 / kWh
  },
  shopping: {
    high: 150,            // kg CO2 / month
    moderate: 80,         // kg CO2 / month
    low: 30               // kg CO2 / month
  }
};

// Calculate monthly carbon footprint from inputs
export function calculateFootprint(inputs: CalculationInput): Omit<CalculationResult, 'id' | 'timestamp'> {
  const { transportMethod, dailyDistance, dietType, electricityUsage, electricityType, shoppingHabits, persona } = inputs;

  // 1. Transportation: daily distance * factor * 30 days
  const transportFactor = EMISSION_FACTORS.transport[transportMethod] ?? 0.18;
  const transportEmissions = Number((dailyDistance * transportFactor * 30).toFixed(1));

  // 2. Food: monthly emissions directly from diet type
  const foodEmissions = EMISSION_FACTORS.diet[dietType] ?? 75;

  // 3. Electricity: usage (kWh/month) * factor
  const electricityFactor = EMISSION_FACTORS.electricity[electricityType] ?? 0.40;
  const energyEmissions = Number((electricityUsage * electricityFactor).toFixed(1));

  // 4. Lifestyle / Shopping: monthly emissions
  const lifestyleEmissions = EMISSION_FACTORS.shopping[shoppingHabits] ?? 80;

  // 5. Total
  const totalEmissions = Number((transportEmissions + foodEmissions + energyEmissions + lifestyleEmissions).toFixed(1));

  // 6. Carbon Score (1 to 100). Higher is better.
  // We define a baseline average world footprint as roughly 400 kg CO2 / month (4.8 tons / year).
  // A score of 100 corresponds to 0 emissions (impossible but represents the upper limit).
  // A score of 50 corresponds to 400 kg CO2 / month (average).
  // A score of 1 corresponds to 1200+ kg CO2 / month (very high).
  let carbonScore = 100;
  if (totalEmissions > 0) {
    // Math: score decreases as emissions increase.
    // e.g. 100 - (total / 10) bounded between 1 and 100.
    carbonScore = Math.max(1, Math.min(100, Math.round(100 - (totalEmissions / 10))));
  }

  // 7. Classification
  let classification: 'Low' | 'Medium' | 'High' = 'Medium';
  if (totalEmissions < 300) {
    classification = 'Low';
  } else if (totalEmissions > 700) {
    classification = 'High';
  }

  return {
    persona,
    inputs,
    transportEmissions,
    foodEmissions,
    energyEmissions,
    lifestyleEmissions,
    totalEmissions,
    carbonScore,
    classification
  };
}

// Global reference baselines for benchmarking (kg CO2 / month)
export const BENCHMARKS = {
  nationalAverages: {
    US: 1300,
    UK: 520,
    India: 160,
    World: 400
  },
  personas: {
    Student: 220,
    Professional: 580,
    'Family Household': 950,
    'Remote Worker': 380,
    'Eco-Conscious User': 110
  }
};
