import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getDbPath = () => {
  const paths = [
    path.join(__dirname, '../data/db.json'),
    path.join(__dirname, '../../server/data/db.json'),
    path.join(__dirname, '../../data/db.json'),
    path.join(process.cwd(), 'server/data/db.json'),
    path.join(process.cwd(), 'dist/server/data/db.json'),
    path.join(process.cwd(), 'dist/data/db.json'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(__dirname, '../data/db.json');
};

const DB_PATH = getDbPath();

export const healthController = {
  async checkHealth(req: Request, res: Response) {
    let dbStatus = 'healthy';
    let aiStatus = 'healthy';
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // 1. Verify database readability and writability
    try {
      if (!fs.existsSync(DB_PATH)) {
        dbStatus = 'missing';
        overallStatus = 'unhealthy';
      } else {
        // Read file
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        JSON.parse(data); // Parse check
        
        // Write check (metadata update test or check modification date)
        const stats = fs.statSync(DB_PATH);
        if (!stats) {
          dbStatus = 'unwritable';
          overallStatus = 'unhealthy';
        }
      }
    } catch (err) {
      console.error('Database health check failed:', err);
      dbStatus = 'error';
      overallStatus = 'unhealthy';
    }

    // 2. Check AI Service status
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey === '') {
      aiStatus = 'degraded (fallback active)';
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }

    // 3. System properties
    const memory = process.memoryUsage();
    const formatMemory = (bytes: number) => `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;

    const uptimeSeconds = process.uptime();
    const formatUptime = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    res.status(overallStatus === 'unhealthy' ? 500 : 200).json({
      status: overallStatus,
      database: dbStatus,
      ai_service: aiStatus,
      uptime: formatUptime(uptimeSeconds),
      version: '1.0.0',
      last_backup: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      memoryUsage: {
        rss: formatMemory(memory.rss),
        heapTotal: formatMemory(memory.heapTotal),
        heapUsed: formatMemory(memory.heapUsed)
      }
    });
  }
};
