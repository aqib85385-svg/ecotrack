import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';

const router = Router();

router.get('/', healthController.checkHealth);

export default router;
