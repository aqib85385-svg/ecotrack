import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Import routers
import footprintRouter from './routes/footprint.js';
import coachRouter from './routes/coach.js';
import simulatorRouter from './routes/simulator.js';
import trackerRouter from './routes/tracker.js';
import benchmarkingRouter from './routes/benchmarking.js';
import challengesRouter from './routes/challenges.js';
import scenarioRouter from './routes/scenario.js';
import auditRouter from './routes/audit.js';
import healthRouter from './routes/health.js';
import demoRouter from './routes/demo.js';

// Import middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { standardRateLimiter } from './middleware/rateLimiter.js';
import { dbService } from './services/dbService.js';

// Initialize env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NODE_ENV === 'test' ? 0 : (process.env.PORT || 5000);

// Apply Security Middlwares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "http://localhost:5173", "http://localhost:5000"]
    }
  }
}));

app.use(cors({
  origin: '*', // Allow all in dev, can restrict in prod
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Apply global rate limiting to all standard API routes
app.use('/api', standardRateLimiter);

// Log requests in dev
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Feature Flag configuration endpoint
app.get('/api/config', (req, res) => {
  res.status(200).json({
    ENABLE_AI: process.env.ENABLE_AI !== 'false', // true by default
    ENABLE_BENCHMARKING: process.env.ENABLE_BENCHMARKING !== 'false',
    ENABLE_SCENARIO_PLANNER: process.env.ENABLE_SCENARIO_PLANNER !== 'false',
    ENABLE_GAMIFICATION: process.env.ENABLE_GAMIFICATION !== 'false',
    ENABLE_CARBON_TWIN: process.env.ENABLE_CARBON_TWIN !== 'false',
    GEMINI_STATUS: (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PLACEHOLDER') ? 'configured' : 'fallback'
  });
});

// Attach specific API modules
app.use('/health', healthRouter);
app.use('/api/footprint', footprintRouter);
app.use('/api/coach', coachRouter);
app.use('/api/simulator', simulatorRouter);
app.use('/api/tracker', trackerRouter);
app.use('/api/benchmarking', benchmarkingRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/scenario', scenarioRouter);
app.use('/api/audit', auditRouter);
app.use('/api/demo', demoRouter);

// Serve client assets in production
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../client');
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Simple welcome endpoint for dev server
  app.get('/', (req, res) => {
    res.send('EcoTrack AI Server is running in Development Mode.');
  });
}

// Global Error Handler
app.use(errorHandler);

// Self-seed on startup if calculations list is empty (Student Persona as default)
dbService.getCalculations().then((calcs) => {
  if (calcs.length === 0) {
    console.log('Database empty. Seeding Student persona data as default on startup...');
    dbService.seedDemoData('Student').then(() => {
      console.log('Startup seed complete.');
    });
  }
});

// Start express server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  EcoTrack AI SaaS Server Started On Port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  API Health endpoint: http://localhost:${PORT}/health`);
  console.log(`===============================================`);
});

export { app, server };
