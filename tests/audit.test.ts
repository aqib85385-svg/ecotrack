import { describe, it, expect, vi } from 'vitest';
import { auditService } from '../server/services/auditService.js';
import { dbService } from '../server/services/dbService.js';

describe('Audit Logging System', () => {
  it('successfully creates and records logging events', async () => {
    // Spy on dbService write method
    const addAuditSpy = vi.spyOn(dbService, 'addAudit').mockImplementation(async () => {});

    await auditService.logEvent('TEST_EVENT', 'test-user', { testKey: 'testVal' });

    expect(addAuditSpy).toHaveBeenCalled();
    const passedLog = addAuditSpy.mock.calls[0][0];
    expect(passedLog.eventType).toBe('TEST_EVENT');
    expect(passedLog.userId).toBe('test-user');
    expect(passedLog.metadata.testKey).toBe('testVal');

    addAuditSpy.mockRestore();
  });
});
