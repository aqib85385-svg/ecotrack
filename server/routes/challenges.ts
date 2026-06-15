import { Router } from 'express';
import { challengesController } from '../controllers/challengesController.js';

const router = Router();

router.get('/list', challengesController.listChallenges);
router.post('/:id/complete', challengesController.completeChallenge);

export default router;
