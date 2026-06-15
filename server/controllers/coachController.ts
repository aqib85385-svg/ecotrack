import { Request, Response } from 'express';
import { dbService } from '../services/dbService.js';
import { riskEngineService } from '../services/riskEngineService.js';
import { geminiService } from '../services/geminiService.js';
import { safetyGateway } from '../services/safetyGateway.js';
import { auditService } from '../services/auditService.js';

export const coachController = {
  async getRecommendations(req: Request, res: Response) {
    try {
      const history = await dbService.getCalculations();
      if (history.length === 0) {
        return res.status(400).json({ error: 'Please submit a carbon footprint calculation first before requesting tips.' });
      }

      // 1. Calculate behavioral risk
      const stats = await dbService.getUserStats();
      const risk = riskEngineService.calculateRisk(history, stats);

      // 2. Fetch recommendations (includes local fallback and priority score calculations)
      const lastCalc = history[history.length - 1];
      const recommendations = await geminiService.getRecommendations(lastCalc, risk.riskLevel);

      // 3. Safety gateway: sanitize output
      const cleanRecommendations = safetyGateway.sanitizeAIOutput(recommendations);

      // 4. Log audit event
      await auditService.logEvent('RECOMMENDATIONS_GENERATED', 'judge-user', {
        calculationId: lastCalc.id,
        riskLevel: risk.riskLevel,
        topAction: cleanRecommendations[0]?.action || 'None'
      });

      res.status(200).json(cleanRecommendations);
    } catch (err: any) {
      console.error('[coachController.getRecommendations] Exception:', err);
      res.status(500).json({ error: err.message || 'Failed to generate recommendations.' });
    }
  },

  async generateReport(req: Request, res: Response) {
    try {
      const history = await dbService.getCalculations();
      if (history.length === 0) {
        return res.status(400).json({ error: 'History is empty. Calculations are required to generate reports.' });
      }

      // 1. Calculate risk
      const stats = await dbService.getUserStats();
      const risk = riskEngineService.calculateRisk(history, stats);

      // 2. Fetch recommendation items to find top action
      const lastCalc = history[history.length - 1];
      const recommendations = await geminiService.getRecommendations(lastCalc, risk.riskLevel);

      // 3. Generate Weekly Report
      const report = await geminiService.generateWeeklyReport(history, risk.riskLevel, stats, recommendations);
      const cleanReport = safetyGateway.sanitizeAIOutput(report);

      // 4. Save report in database
      await dbService.addWeeklyReport(cleanReport);

      // 5. Log audit trail
      await auditService.logEvent('WEEKLY_REPORT_GENERATED', 'judge-user', {
        reportId: cleanReport.id,
        score: cleanReport.sustainabilityScore,
        riskLevel: cleanReport.riskLevel
      });

      res.status(200).json(cleanReport);
    } catch (err: any) {
      console.error('[coachController.generateReport] Exception:', err);
      res.status(500).json({ error: err.message || 'Failed to generate weekly sustainability report.' });
    }
  },

  async getReportHistory(req: Request, res: Response) {
    try {
      const reports = await dbService.getWeeklyReports();
      res.status(200).json(reports);
    } catch (err: any) {
      console.error('[coachController.getReportHistory] Exception:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch report history.' });
    }
  }
};
