import { Request, Response, NextFunction } from 'express';

export const validator = {
  validateCalculationInput(req: Request, res: Response, next: NextFunction) {
    const { persona, transportMethod, dailyDistance, dietType, electricityUsage, electricityType, shoppingHabits } = req.body;

    if (!persona || !transportMethod || dailyDistance === undefined || !dietType || electricityUsage === undefined || !electricityType || !shoppingHabits) {
      return res.status(400).json({ error: 'Missing required inputs. All footprint fields are required.' });
    }

    if (typeof dailyDistance !== 'number' || dailyDistance < 0 || dailyDistance > 10000) {
      return res.status(400).json({ error: 'dailyDistance must be a number between 0 and 10,000 km.' });
    }

    if (typeof electricityUsage !== 'number' || electricityUsage < 0 || electricityUsage > 100000) {
      return res.status(400).json({ error: 'electricityUsage must be a number between 0 and 100,000 kWh.' });
    }

    const validPersonas = ['Student', 'Professional', 'Family Household', 'Remote Worker', 'Eco-Conscious User'];
    if (!validPersonas.includes(persona)) {
      return res.status(400).json({ error: `Invalid persona: ${persona}` });
    }

    const validTransports = ['petrol_car', 'diesel_car', 'ev', 'public_transit', 'walk_cycle'];
    if (!validTransports.includes(transportMethod)) {
      return res.status(400).json({ error: `Invalid transportMethod: ${transportMethod}` });
    }

    const validDiets = ['omnivore', 'average_meat', 'pescatarian', 'vegetarian', 'vegan'];
    if (!validDiets.includes(dietType)) {
      return res.status(400).json({ error: `Invalid dietType: ${dietType}` });
    }

    const validElectricityTypes = ['grid', 'green'];
    if (!validElectricityTypes.includes(electricityType)) {
      return res.status(400).json({ error: `Invalid electricityType: ${electricityType}` });
    }

    const validShoppingHabits = ['high', 'moderate', 'low'];
    if (!validShoppingHabits.includes(shoppingHabits)) {
      return res.status(400).json({ error: `Invalid shoppingHabits: ${shoppingHabits}` });
    }

    next();
  },

  validateScenarioInput(req: Request, res: Response, next: NextFunction) {
    const { goalType } = req.body;
    const validGoals = ['reduction_10', 'reduction_25', 'money_10000', 'top_20'];

    if (!goalType || !validGoals.includes(goalType)) {
      return res.status(400).json({ error: `Invalid or missing goalType. Must be one of: ${validGoals.join(', ')}` });
    }

    next();
  },

  validateSimulationInput(req: Request, res: Response, next: NextFunction) {
    const { switchTransit, reduceElectricityPct, newDietType, newShoppingHabits } = req.body;

    if (switchTransit !== undefined && typeof switchTransit !== 'boolean') {
      return res.status(400).json({ error: 'switchTransit must be a boolean.' });
    }

    if (reduceElectricityPct !== undefined) {
      if (typeof reduceElectricityPct !== 'number' || reduceElectricityPct < 0 || reduceElectricityPct > 100) {
        return res.status(400).json({ error: 'reduceElectricityPct must be a number between 0 and 100.' });
      }
    }

    if (newDietType !== undefined && newDietType !== '') {
      const validDiets = ['omnivore', 'average_meat', 'pescatarian', 'vegetarian', 'vegan'];
      if (!validDiets.includes(newDietType)) {
        return res.status(400).json({ error: `Invalid dietType: ${newDietType}` });
      }
    }

    if (newShoppingHabits !== undefined && newShoppingHabits !== '') {
      const validShopping = ['high', 'moderate', 'low'];
      if (!validShopping.includes(newShoppingHabits)) {
        return res.status(400).json({ error: `Invalid shoppingHabits: ${newShoppingHabits}` });
      }
    }

    next();
  },

  validateChallengeParam(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9-]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid challenge ID parameter format. Must be alphanumeric and hyphens only.' });
    }
    next();
  }
};
