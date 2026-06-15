import { Router } from 'express';
import { trackerController } from '../controllers/trackerController.js';

const router = Router();

router.get('/history', trackerController.getHistory);
router.get('/twin', trackerController.getTwin);

export default router;
