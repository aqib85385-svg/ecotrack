import { Router } from 'express';
import { challengesController } from '../controllers/challengesController.js';
import { validator } from '../middleware/validator.js';
import { securityFilter } from '../middleware/securityFilter.js';

const router = Router();

router.get('/list', challengesController.listChallenges);
router.post('/:id/complete', securityFilter, validator.validateChallengeParam, challengesController.completeChallenge);

export default router;
