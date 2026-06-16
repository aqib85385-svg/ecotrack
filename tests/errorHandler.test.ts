import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../server/server.js';
import { errorHandler } from '../server/middleware/errorHandler.js';
import { dbService } from '../server/services/dbService.js';

describe('Global Error Handler Middleware', () => {
  it('handles standard errors by returning status and JSON message', () => {
    const err = { status: 400, message: 'Bad request validation' };
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Bad request validation',
      status: 400
    }));
  });

  it('handles generic 500 status and default message when none provided', () => {
    const err = new Error();
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Internal Server Error',
      status: 500
    }));
  });

  it('masks stack traces and messages in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new Error('Secret database credentials leaked!');
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    const next = vi.fn();

    try {
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'An internal error occurred. Please contact the administrator.',
        status: 500
      });
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('Express Controllers DB Failure & Error Handling Integration', () => {
  it('GET /api/tracker/history returns 500 when database read fails', async () => {
    // Spy on getDb and force it to reject
    const spy = vi.spyOn(dbService, 'getDb').mockRejectedValue(new Error('Disk read failure'));

    const res = await request(app).get('/api/tracker/history');
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Disk read failure');

    spy.mockRestore();
  });

  it('POST /api/coach/report returns 500 when weekly report saving fails', async () => {
    // Spy on addWeeklyReport and force it to throw
    const spy = vi.spyOn(dbService, 'addWeeklyReport').mockRejectedValue(new Error('Database write locked'));

    const res = await request(app).post('/api/coach/report');
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Database write locked');

    spy.mockRestore();
  });
});
