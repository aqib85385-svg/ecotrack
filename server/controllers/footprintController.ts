import { Request, Response } from 'express';
import { dbService } from '../services/dbService.js';
import { calculateFootprint } from '../../shared/formulas.js';
import { auditService } from '../services/auditService.js';
import { CalculationResult } from '../../shared/types.js';

export const footprintController = {
  async calculate(req: Request, res: Response) {
    try {
      const inputs = req.body;

      // 1. Run core calculation
      const calculated = calculateFootprint(inputs);

      // 2. Build full calculation result record
      const calcResult: CalculationResult = {
        id: `calc-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...calculated
      };

      // 3. Save to database
      await dbService.addCalculation(calcResult);

      // 4. Update user stats (award points + update lastActive)
      const stats = await dbService.getUserStats();
      const newPoints = stats.points + 15; // award 15 points per entry

      // Update streak: if last active was yesterday, increment. If today, keep same. If older, reset to 1.
      let newStreak = stats.streak || 1;
      const todayStr = new Date().toDateString();
      if (stats.lastActive) {
        const lastActiveDate = new Date(stats.lastActive);
        const lastActiveStr = lastActiveDate.toDateString();
        
        if (lastActiveStr !== todayStr) {
          const diffMs = new Date().getTime() - lastActiveDate.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays <= 2) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }
      }

      await dbService.updateUserStats({
        points: newPoints,
        streak: newStreak,
        lastActive: new Date().toISOString()
      });

      // 5. Audit Logging
      await auditService.logEvent('CALCULATION_CREATED', 'judge-user', {
        calculationId: calcResult.id,
        totalEmissions: calcResult.totalEmissions,
        score: calcResult.carbonScore
      });

      res.status(200).json(calcResult);
    } catch (err: any) {
      console.error('[footprintController.calculate] Exception:', err);
      res.status(500).json({ error: err.message || 'Failed to process footprint calculation.' });
    }
  }
};
