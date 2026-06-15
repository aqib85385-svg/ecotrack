import { describe, it, expect, vi } from 'vitest';
import { dbService } from '../server/services/dbService.js';
import { scenarioController } from '../server/controllers/scenarioController.js';

describe('Scenario Planner Roadmap Synthesis', () => {
  it('correctly calculates reduction targets and monthly steps', async () => {
    // Mock database calculation log
    const getCalculationsSpy = vi.spyOn(dbService, 'getCalculations').mockImplementation(async () => [
      {
        id: 'calc-1',
        timestamp: new Date().toISOString(),
        persona: 'Student',
        inputs: {
          persona: 'Student',
          transportMethod: 'petrol_car',
          dailyDistance: 10,
          dietType: 'average_meat',
          electricityUsage: 150,
          electricityType: 'grid',
          shoppingHabits: 'moderate'
        },
        transportEmissions: 54,
        foodEmissions: 75,
        energyEmissions: 60,
        lifestyleEmissions: 80,
        totalEmissions: 269,
        carbonScore: 73,
        classification: 'Low'
      }
    ]);

    const getUserStatsSpy = vi.spyOn(dbService, 'getUserStats').mockImplementation(async () => ({
      points: 100,
      streak: 1,
      completedChallenges: [],
      unlockedAchievements: [],
      lastActive: new Date().toISOString()
    }));

    const logEventSpy = vi.spyOn(dbService, 'addAudit').mockImplementation(async () => {});

    // Mock Express request / response
    const req = {
      body: { goalType: 'reduction_10' }
    } as any;

    let resData: any = null;
    const res = {
      status: (code: number) => {
        expect(code).toBe(200);
        return {
          json: (data: any) => {
            resData = data;
          }
        };
      }
    } as any;

    await scenarioController.generatePlan(req, res);

    expect(resData).not.toBeNull();
    // 10% of 269 is ~26.9 kg
    expect(resData.monthlyCo2ReductionGoal).toBeCloseTo(26.9, 1);
    expect(resData.roadmap.length).toBe(3); // 3 month roadmap
    expect(resData.probability).toBeGreaterThan(50); // Student profile should have a high probability

    getCalculationsSpy.mockRestore();
    getUserStatsSpy.mockRestore();
    logEventSpy.mockRestore();
  });
});
