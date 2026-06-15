import { Request, Response } from 'express';
import { dbService } from '../services/dbService.js';
import { calculateFootprint } from '../../shared/formulas.js';
import { CalculationInput } from '../../shared/types.js';

export const simulatorController = {
  async simulate(req: Request, res: Response) {
    try {
      const history = await dbService.getCalculations();
      if (history.length === 0) {
        return res.status(400).json({ error: 'Please submit a footprint calculation baseline before simulating scenarios.' });
      }

      const latest = history[history.length - 1];
      const {
        switchTransit,       // boolean
        reduceElectricityPct, // number (0 to 100)
        newDietType,         // string
        newShoppingHabits    // string
      } = req.body;

      // Construct a projected inputs object starting from the user's latest baseline inputs
      const projectedInputs: CalculationInput = {
        ...latest.inputs,
        ...(switchTransit ? { transportMethod: 'public_transit' } : {}),
        ...(reduceElectricityPct !== undefined ? {
          electricityUsage: Math.max(0, Math.round(latest.inputs.electricityUsage * (1 - reduceElectricityPct / 100)))
        } : {}),
        ...(newDietType ? { dietType: newDietType } : {}),
        ...(newShoppingHabits ? { shoppingHabits: newShoppingHabits } : {})
      };

      // Calculate projected footprint
      const projected = calculateFootprint(projectedInputs);

      const originalTotal = latest.totalEmissions;
      const projectedTotal = projected.totalEmissions;
      const monthlyReduction = Number((originalTotal - projectedTotal).toFixed(1));
      const annualReduction = Number((monthlyReduction * 12).toFixed(1));

      res.status(200).json({
        baseline: {
          transport: latest.transportEmissions,
          food: latest.foodEmissions,
          energy: latest.energyEmissions,
          lifestyle: latest.lifestyleEmissions,
          total: originalTotal,
          score: latest.carbonScore
        },
        projected: {
          transport: projected.transportEmissions,
          food: projected.foodEmissions,
          energy: projected.energyEmissions,
          lifestyle: projected.lifestyleEmissions,
          total: projectedTotal,
          score: projected.carbonScore
        },
        monthlyReduction: Math.max(0, monthlyReduction),
        annualReduction: Math.max(0, annualReduction)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Simulation processing failed.' });
    }
  }
};
