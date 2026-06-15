import { Router } from 'express';
import { scenarioController } from '../controllers/scenarioController.js';
import { validator } from '../middleware/validator.js';
import { securityFilter } from '../middleware/securityFilter.js';

const router = Router();

router.post('/plan', securityFilter, validator.validateScenarioInput, scenarioController.generatePlan);

export default router;
