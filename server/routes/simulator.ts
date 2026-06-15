import { Router } from 'express';
import { simulatorController } from '../controllers/simulatorController.js';
import { securityFilter } from '../middleware/securityFilter.js';

const router = Router();

router.post('/simulate', securityFilter, simulatorController.simulate);

export default router;
