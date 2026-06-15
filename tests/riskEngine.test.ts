import { describe, it, expect } from 'vitest';
import { riskEngineService } from '../server/services/riskEngineService.js';
import { CalculationResult, UserStats } from '../shared/types.js';

describe('Behavioral Risk Engine', () => {
  it('correctly maps High Risk when emissions increase consecutively', () => {
    const history: CalculationResult[] = [
      { id: '1', timestamp: new Date().toISOString(), totalEmissions: 100 } as any,
      { id: '2', timestamp: new Date().toISOString(), totalEmissions: 120 } as any,
      { id: '3', timestamp: new Date().toISOString(), totalEmissions: 140 } as any // consecutive rise
    ];
    const stats: UserStats = {
      points: 50,
      streak: 0,
      completedChallenges: [],
      unlockedAchievements: [],
      lastActive: new Date().toISOString()
    };

    const risk = riskEngineService.calculateRisk(history, stats);
    expect(risk.riskLevel).toBe('High');
  });

  it('maps Low Risk for declining emissions with challenge completions', () => {
    const history: CalculationResult[] = [
      { id: '1', timestamp: new Date().toISOString(), totalEmissions: 150 } as any,
      { id: '2', timestamp: new Date().toISOString(), totalEmissions: 120 } as any,
      { id: '3', timestamp: new Date().toISOString(), totalEmissions: 90 } as any // steady reduction
    ];
    const stats: UserStats = {
      points: 200,
      streak: 2,
      completedChallenges: ['chal-1', 'chal-2', 'chal-3'], // active engagement
      unlockedAchievements: [],
      lastActive: new Date().toISOString()
    };

    const risk = riskEngineService.calculateRisk(history, stats);
    expect(risk.riskLevel).toBe('Low');
  });
});
