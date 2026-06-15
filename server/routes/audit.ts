import { Router } from 'express';
import { auditController } from '../controllers/auditController.js';

const router = Router();

router.get('/logs', auditController.getAuditLogs);

export default router;
