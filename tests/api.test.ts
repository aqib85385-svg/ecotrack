import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app, server } from '../server/server.js';
import { dbService } from '../server/services/dbService.js';


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

  // Scenario Planner integration test
  it('POST /api/scenario/plan synthesizes a months roadmap', async () => {
    const res = await request(app)
      .post('/api/scenario/plan')
      .send({ goalType: 'reduction_10' });

    expect(res.status).toBe(200);
    expect(res.body.totalCo2Reduction).toBeDefined();
    expect(res.body.roadmap).toBeInstanceOf(Array);
    expect(res.body.roadmap.length).toBeGreaterThan(0);
  });

  // Benchmarking integration test
  it('GET /api/benchmarking/compare retrieves rankings and comparisons', async () => {
    const res = await request(app).get('/api/benchmarking/compare');
    expect(res.status).toBe(200);
    expect(res.body.userFootprint).toBeDefined();
    expect(res.body.ranking).toBeDefined();
    expect(res.body.leaderboard).toBeInstanceOf(Array);
  });

  // Challenges list and completion integration test
  it('GET and POST /api/challenges list and increments user points', async () => {
    // List challenges
    const listRes = await request(app).get('/api/challenges/list');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toBeInstanceOf(Array);
    expect(listRes.body.length).toBeGreaterThan(0);

    const uncompleted = listRes.body.find((c: any) => !c.completed);
    const challengeId = uncompleted ? uncompleted.id : listRes.body[0].id;

    // Complete challenge
    const completeRes = await request(app).post(`/api/challenges/${challengeId}/complete`);
    if (uncompleted) {
      expect(completeRes.status).toBe(200);
      expect(completeRes.body.message).toContain('completed');
      expect(completeRes.body.stats.points).toBeDefined();
    } else {
      expect(completeRes.status).toBe(400);
      expect(completeRes.body.error).toContain('already completed');
    }
  });

  // Carbon Twin forecast path integration test
  it('GET /api/tracker/twin retrieves predictive forecasts lines', async () => {
    const res = await request(app).get('/api/tracker/twin');
    expect(res.status).toBe(200);
    expect(res.body.confidence).toBeDefined();
    expect(res.body.forecast).toBeInstanceOf(Array);
  });

  // Demo seeder path integration test
  it('POST /api/demo/seed populates calculations and changes state', async () => {
    const res = await request(app)
      .post('/api/demo/seed')
      .send({ persona: 'Professional' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('seeded');

    // Subsequent history check
    const historyRes = await request(app).get('/api/tracker/history');
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.history.length).toBeGreaterThan(0);
    expect(historyRes.body.history[historyRes.body.history.length - 1].persona).toBe('Professional');
  });

  // AI Coach and Audit logs integration tests
  it('GET /api/coach/recommendations returns 400 when calculation history is empty', async () => {
    const db = await dbService.getDb();
    const originalCalcs = db.calculations;
    db.calculations = [];
    await dbService.saveDb(db);

    try {
      const res = await request(app).get('/api/coach/recommendations');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain(' footprint calculation first');
    } finally {
      db.calculations = originalCalcs;
      await dbService.saveDb(db);
    }
  });

  it('POST /api/coach/report returns 400 when calculation history is empty', async () => {
    const db = await dbService.getDb();
    const originalCalcs = db.calculations;
    db.calculations = [];
    await dbService.saveDb(db);

    try {
      const res = await request(app).post('/api/coach/report');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Calculations are required');
    } finally {
      db.calculations = originalCalcs;
      await dbService.saveDb(db);
    }
  });

  it('GET /api/coach/recommendations returns 200 with recommendations list', async () => {
    const res = await request(app).get('/api/coach/recommendations');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].action).toBeDefined();
    expect(res.body[0].category).toBeDefined();
  });

  it('POST /api/coach/report returns 200 with generated report', async () => {
    const res = await request(app).post('/api/coach/report');
    expect(res.status).toBe(200);
    expect(res.body.sustainabilityScore).toBeDefined();
    expect(res.body.trends).toBeDefined();
    expect(res.body.formattedReport).toBeDefined();
  });

  it('GET /api/coach/report/history returns 200 with report history list', async () => {
    const res = await request(app).get('/api/coach/report/history');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/audit/logs returns 200 with audit logs list in reverse chronological order', async () => {
    const res = await request(app).get('/api/audit/logs');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].eventType).toBeDefined();
    expect(res.body[0].timestamp).toBeDefined();
    
    // Check descending order of timestamp
    if (res.body.length >= 2) {
      const firstTime = new Date(res.body[0].timestamp).getTime();
      const secondTime = new Date(res.body[1].timestamp).getTime();
      expect(firstTime).toBeGreaterThanOrEqual(secondTime);
    }
  });
});


