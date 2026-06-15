import { Router } from 'express';
import { coachController } from '../controllers/coachController.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { securityFilter } from '../middleware/securityFilter.js';

const router = Router();

router.get('/recommendations', aiRateLimiter, coachController.getRecommendations);
router.post('/report', aiRateLimiter, securityFilter, coachController.generateReport);
router.get('/report/history', coachController.getReportHistory);

export default router;
