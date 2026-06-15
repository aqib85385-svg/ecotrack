import { dbService } from './dbService.js';
import { AuditLog } from '../../shared/types.js';

export const auditService = {
  async logEvent(eventType: string, userId: string, metadata: Record<string, any>): Promise<void> {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      eventType,
      timestamp: new Date().toISOString(),
      userId,
      metadata
    };

    try {
      await dbService.addAudit(newLog);
    } catch (err) {
      console.error('Failed to log audit event:', err);
    }
  },

  async getLogs(): Promise<AuditLog[]> {
    return dbService.getAudits();
  }
};
