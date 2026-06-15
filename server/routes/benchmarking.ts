import { Router } from 'express';
import { benchmarkingController } from '../controllers/benchmarkingController.js';

const router = Router();

router.get('/compare', benchmarkingController.getBenchmark);

export default router;
