import { Request, Response } from 'express';
import { auditService } from '../services/auditService.js';

export const auditController = {
  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await auditService.getLogs();
      res.status(200).json(logs.reverse()); // latest first
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch audit logs.' });
    }
  }
};
