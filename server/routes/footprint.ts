import { Router } from 'express';
import { footprintController } from '../controllers/footprintController.js';
import { validator } from '../middleware/validator.js';
import { securityFilter } from '../middleware/securityFilter.js';

const router = Router();

router.post('/calculate', securityFilter, validator.validateCalculationInput, footprintController.calculate);

export default router;
