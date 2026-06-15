import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, server } from '../server/server.js';

describe('Express REST API Endpoints Integration', () => {
  // Close the server listener after tests complete to avoid blocking node process
  afterAll(() => {
    server.close();
  });

  it('GET /health returns healthy system status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /api/config returns feature flag configs', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body.ENABLE_AI).toBeDefined();
    expect(res.body.ENABLE_CARBON_TWIN).toBe(true);
  });

  it('POST /api/footprint/calculate returns calculated values', async () => {
    const res = await request(app)
      .post('/api/footprint/calculate')
      .send({
        persona: 'Student',
        transportMethod: 'public_transit',
        dailyDistance: 10,
        dietType: 'vegan',
        electricityUsage: 120,
        electricityType: 'green',
        shoppingHabits: 'low'
      });

    expect(res.status).toBe(200);
    expect(res.body.totalEmissions).toBeDefined();
    expect(res.body.carbonScore).toBeGreaterThan(0);
  });

  it('rejects out of bounds daily distance', async () => {
    const res = await request(app)
      .post('/api/footprint/calculate')
      .send({
        persona: 'Student',
        transportMethod: 'public_transit',
        dailyDistance: -5, // invalid
        dietType: 'vegan',
        electricityUsage: 120,
        electricityType: 'green',
        shoppingHabits: 'low'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
