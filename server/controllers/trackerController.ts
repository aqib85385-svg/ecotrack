import { Request, Response } from 'express';
import { dbService } from '../services/dbService.js';
import { riskEngineService } from '../services/riskEngineService.js';
import { carbonTwinService } from '../services/carbonTwinService.js';
import { auditService } from '../services/auditService.js';

export const trackerController = {
  async getHistory(req: Request, res: Response) {
    try {
      const history = await dbService.getCalculations();
      const stats = await dbService.getUserStats();
      
      const risk = riskEngineService.calculateRisk(history, stats);

      // Return historical calculations, stats, achievements and the behavioral risk evaluations
      res.status(200).json({
        history,
        stats,
        risk: {
          level: risk.riskLevel,
          reason: risk.reason,
          metrics: risk.metrics
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch tracking history.' });
    }
  },

  async getTwin(req: Request, res: Response) {
    try {
      const history = await dbService.getCalculations();
      const twinData = carbonTwinService.generateForecast(history);

      // Audit Logging
      await auditService.logEvent('CARBON_TWIN_UPDATED', 'judge-user', {
        confidence: twinData.confidence,
        baselineProjected: twinData.forecast[0]?.baseline || 0
      });

      res.status(200).json(twinData);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch Carbon Twin forecasts.' });
    }
  }
};
