import { Request, Response } from 'express';
import { dbService } from '../services/dbService.js';
import { riskEngineService } from '../services/riskEngineService.js';
import { auditService } from '../services/auditService.js';
import { ScenarioPlan, ScenarioMilestone } from '../../shared/types.js';

export const scenarioController = {
  async generatePlan(req: Request, res: Response) {
    try {
      const { goalType } = req.body;
      const history = await dbService.getCalculations();

      if (history.length === 0) {
        return res.status(400).json({ error: 'Please submit a footprint calculation baseline before building a scenario roadmap.' });
      }

      const latest = history[history.length - 1];
      const stats = await dbService.getUserStats();
      const risk = riskEngineService.calculateRisk(history, stats);
      const persona = latest.persona;

      // 1. Calculate targets based on goalType
      let monthlyCo2ReductionGoal = 0;
      let monthlySavingsGoal = 0;
      let targetDateStr = '';
      const timeRequired = '3 Months';

      const now = new Date();
      const targetDate = new Date(now.getFullYear(), now.getMonth() + 3, 15);
      targetDateStr = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (goalType === 'reduction_10') {
        monthlyCo2ReductionGoal = Number((latest.totalEmissions * 0.1).toFixed(1));
        monthlySavingsGoal = Number((monthlyCo2ReductionGoal * 10).toFixed(0)); // rough estimate
      } else if (goalType === 'reduction_25') {
        monthlyCo2ReductionGoal = Number((latest.totalEmissions * 0.25).toFixed(1));
        monthlySavingsGoal = Number((monthlyCo2ReductionGoal * 10).toFixed(0));
      } else if (goalType === 'money_10000') {
        // ₹10,000 annually = ₹833 / month
        monthlySavingsGoal = 833;
        monthlyCo2ReductionGoal = Number((monthlySavingsGoal / 20).toFixed(1)); // rough estimate
      } else if (goalType === 'top_20') {
        // target top 20% requires getting emissions down to e.g. 200 kg CO2
        const targetEmissions = 200;
        monthlyCo2ReductionGoal = Number(Math.max(10, latest.totalEmissions - targetEmissions).toFixed(1));
        monthlySavingsGoal = Number((monthlyCo2ReductionGoal * 12).toFixed(0));
      }

      // 2. Generate roadmap based on Persona
      const roadmap: ScenarioMilestone[] = [];
      
      // We generate customized monthly steps based on the user's persona
      if (persona === 'Student') {
        roadmap.push({
          month: 1,
          actions: ['Switch short car commutes to walking/cycling', 'Implement 2 vegetarian days per week'],
          monthlyCo2Reduction: Number((monthlyCo2ReductionGoal * 0.4).toFixed(1)),
          monthlySavings: Number((monthlySavingsGoal * 0.4).toFixed(0))
        });
        roadmap.push({
          month: 2,
          actions: ['Use public transport (metro/bus) for daily college commute', 'Unplug chargers and idle devices'],
          monthlyCo2Reduction: Number((monthlyCo2ReductionGoal * 0.7).toFixed(1)),
          monthlySavings: Number((monthlySavingsGoal * 0.7).toFixed(0))
        });
        roadmap.push({
          month: 3,
          actions: ['Adopt a fully vegetarian/vegan diet', 'Practice minimalist lifestyle shopping'],
          monthlyCo2Reduction: monthlyCo2ReductionGoal,
          monthlySavings: monthlySavingsGoal
        });
      } else if (persona === 'Professional') {
        roadmap.push({
          month: 1,
          actions: ['Carpool with coworkers twice a week', 'Replace all home lighting with smart LED bulbs'],
          monthlyCo2Reduction: Number((monthlyCo2ReductionGoal * 0.35).toFixed(1)),
          monthlySavings: Number((monthlySavingsGoal * 0.3).toFixed(0))
        });
        roadmap.push({
          month: 2,
          actions: ['Reduce vehicle travel and use public transit for work commutes', 'Turn off standby power strips'],
          monthlyCo2Reduction: Number((monthlyCo2ReductionGoal * 0.65).toFixed(1)),
          monthlySavings: Number((monthlySavingsGoal * 0.65).toFixed(0))
        });
        roadmap.push({
          month: 3,
          actions: ['Invest in home smart climate thermostat', 'Transition to an electric vehicle'],
          monthlyCo2Reduction: monthlyCo2ReductionGoal,
          monthlySavings: monthlySavingsGoal
        });
      } else {
        // Household / Remote / Eco-Conscious default
        roadmap.push({
          month: 1,
          actions: ['Install energy-efficient LED lighting', 'Set heating/AC thermostat 2°C higher/lower'],
          monthlyCo2Reduction: Number((monthlyCo2ReductionGoal * 0.4).toFixed(1)),
          monthlySavings: Number((monthlySavingsGoal * 0.4).toFixed(0))
        });
        roadmap.push({
          month: 2,
          actions: ['Plan meals to reduce food waste by 30%', 'Practice batch purchasing and buy in bulk'],
          monthlyCo2Reduction: Number((monthlyCo2ReductionGoal * 0.7).toFixed(1)),
          monthlySavings: Number((monthlySavingsGoal * 0.7).toFixed(0))
        });
        roadmap.push({
          month: 3,
          actions: ['Install residential solar panels (or green power contract)', 'Compost all household organic waste'],
          monthlyCo2Reduction: monthlyCo2ReductionGoal,
          monthlySavings: monthlySavingsGoal
        });
      }

      // 3. Probability calculation
      // Risk level penalty: Low = +10%, Medium = +0%, High = -20%
      let probability = 85; // baseline
      if (risk.riskLevel === 'High') {
        probability -= 25;
      } else if (risk.riskLevel === 'Low') {
        probability = Math.min(98, probability + 10);
      }
      // Difficulty penalty (based on reduction volume)
      if (monthlyCo2ReductionGoal > 300) {
        probability = Math.max(30, probability - 15);
      }

      const plan: ScenarioPlan = {
        goalType,
        targetDate: targetDateStr,
        monthlySavingsGoal,
        monthlyCo2ReductionGoal,
        roadmap,
        totalCo2Reduction: Number((monthlyCo2ReductionGoal * 12).toFixed(1)), // annual savings
        totalSavings: Number((monthlySavingsGoal * 12).toFixed(0)), // annual savings
        probability,
        timeRequired
      };

      // 4. Log audit event
      await auditService.logEvent('SCENARIO_PLAN_CREATED', 'judge-user', {
        goalType,
        targetDate: targetDateStr,
        annualCo2Reduction: plan.totalCo2Reduction,
        probability
      });

      res.status(200).json(plan);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate scenario plan.' });
    }
  }
};
