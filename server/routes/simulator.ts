import { Router } from 'express';
import { simulatorController } from '../controllers/simulatorController.js';
import { securityFilter } from '../middleware/securityFilter.js';
import { validator } from '../middleware/validator.js';

const router = Router();

router.post('/simulate', securityFilter, validator.validateSimulationInput, simulatorController.simulate);

export default router;
