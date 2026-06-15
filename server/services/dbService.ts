import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { CalculationResult, UserStats, Challenge, AuditLog, WeeklyReport, UserPersona } from '../../shared/types.js';

// ES Module dirname resolution
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

// Interface for DB file content
interface DatabaseSchema {
  calculations: CalculationResult[];
  userStats: UserStats;
  challenges: Challenge[];
  audits: AuditLog[];
  weeklyReports: WeeklyReport[];
}

// In-memory queue to prevent race conditions during reads/writes
class TaskQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    const task = this.queue.shift();
    if (task) {
      try {
        await task();
      } catch (err) {
        console.error('Queue task error:', err);
      }
    }
    this.processing = false;
    this.processNext();
  }
}

const dbQueue = new TaskQueue();

export const dbService = {
  // Read database state synchronously or asynchronously
  async getDb(): Promise<DatabaseSchema> {
    return dbQueue.enqueue(async () => {
      try {
        if (!fs.existsSync(DB_PATH)) {
          throw new Error(`Database file not found at ${DB_PATH}`);
        }
        const data = await fs.promises.readFile(DB_PATH, 'utf-8');
        const parsed = JSON.parse(data) || {};
        return {
          calculations: parsed.calculations || [],
          userStats: parsed.userStats || { points: 0, streak: 0, completedChallenges: [], unlockedAchievements: [], lastActive: '' },
          challenges: parsed.challenges || [],
          audits: parsed.audits || [],
          weeklyReports: parsed.weeklyReports || []
        };
      } catch (err) {
        console.error('Error reading database file, returning default structure', err);
        return { calculations: [], userStats: { points: 0, streak: 0, completedChallenges: [], unlockedAchievements: [], lastActive: '' }, challenges: [], audits: [], weeklyReports: [] };
      }
    });
  },

  // Save database state
  async saveDb(db: DatabaseSchema): Promise<void> {
    return dbQueue.enqueue(async () => {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    });
  },

  // Get specific model collections
  async getCalculations(): Promise<CalculationResult[]> {
    const db = await this.getDb();
    return db.calculations || [];
  },

  async getUserStats(): Promise<UserStats> {
    const db = await this.getDb();
    return db.userStats;
  },

  async getChallenges(): Promise<Challenge[]> {
    const db = await this.getDb();
    return db.challenges || [];
  },

  async getAudits(): Promise<AuditLog[]> {
    const db = await this.getDb();
    return db.audits || [];
  },

  async getWeeklyReports(): Promise<WeeklyReport[]> {
    const db = await this.getDb();
    return db.weeklyReports || [];
  },

  // Push new items
  async addCalculation(calc: CalculationResult): Promise<void> {
    const db = await this.getDb();
    db.calculations = db.calculations || [];
    db.calculations.push(calc);
    await this.saveDb(db);
  },

  async updateUserStats(stats: Partial<UserStats>): Promise<UserStats> {
    const db = await this.getDb();
    db.userStats = { ...db.userStats, ...stats };
    await this.saveDb(db);
    return db.userStats;
  },

  async addAudit(log: AuditLog): Promise<void> {
    const db = await this.getDb();
    db.audits = db.audits || [];
    db.audits.push(log);
    await this.saveDb(db);
  },

  async addWeeklyReport(report: WeeklyReport): Promise<void> {
    const db = await this.getDb();
    db.weeklyReports = db.weeklyReports || [];
    db.weeklyReports.push(report);
    await this.saveDb(db);
  },

  // Seed demo data for the selected persona
  async seedDemoData(persona: UserPersona): Promise<void> {
    const db = await this.getDb();
    
    // Clear user calculations, reports, and reset stats
    db.calculations = [];
    db.weeklyReports = [];
    db.audits = [];

    const now = new Date();
    
    // Generate 6 months of historical calculations with trends
    const months = 6;
    const history: CalculationResult[] = [];

    let points = 100;
    let streak = 2;
    let completedChallenges: string[] = [];
    let unlockedAchievements: string[] = ['Green Starter'];

    if (persona === 'Student') {
      points = 320;
      streak = 5;
      completedChallenges = ['chal-1', 'chal-2', 'chal-3'];
      unlockedAchievements = ['Green Starter', 'Eco Hero'];
      
      // Student profile: Low starting emissions, consistently minor reductions (4-5% reduction over time)
      const baseTransport = 60; // public transit & walk
      const baseEnergy = 40; // grid 100 kWh
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
        const multiplier = 1 - (months - 1 - i) * 0.03; // ~15% reduction total
        history.push({
          id: `calc-student-${i}`,
          timestamp: date.toISOString(),
          persona: 'Student',
          inputs: {
            persona: 'Student',
            transportMethod: 'public_transit',
            dailyDistance: 12 - (months - 1 - i) * 1.5, // decreasing distance
            dietType: i > 2 ? 'vegetarian' : 'vegan', // transitioned to vegan
            electricityUsage: 110 - (months - 1 - i) * 5,
            electricityType: 'grid',
            shoppingHabits: 'low'
          },
          transportEmissions: Number((baseTransport * multiplier).toFixed(1)),
          foodEmissions: i > 2 ? 51 : 45,
          energyEmissions: Number((baseEnergy * multiplier).toFixed(1)),
          lifestyleEmissions: 30,
          totalEmissions: Number(((baseTransport * multiplier) + (i > 2 ? 51 : 45) + (baseEnergy * multiplier) + 30).toFixed(1)),
          carbonScore: Math.min(100, Math.round(80 + (months - 1 - i) * 2.5)),
          classification: 'Low'
        });
      }
    } else if (persona === 'Professional') {
      points = 180;
      streak = 1;
      completedChallenges = ['chal-3', 'chal-4'];
      unlockedAchievements = ['Green Starter'];
      
      // Professional: High emissions (driving car daily), fluctuating trend (up then slightly down)
      const baseEnergy = 120; // 300 kWh grid
      const baseLifestyle = 80; // moderate consumer

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
        // Emissions increased in middle, then drop slightly due to public transit usage
        let multiplier = 1.0;
        let transportMethod: 'petrol_car' | 'public_transit' = 'petrol_car';
        let dailyDistance = 35;
        if (i === 0) {
          multiplier = 0.85; // started taking transit
          transportMethod = 'public_transit';
          dailyDistance = 15; // only drive a bit
        } else if (i === 1) {
          multiplier = 0.95;
        } else if (i === 2 || i === 3) {
          multiplier = 1.1; // increased driving
        }

        const transportCalculated = transportMethod === 'petrol_car' 
          ? dailyDistance * 0.18 * 30 
          : dailyDistance * 0.04 * 30 + 15 * 0.18 * 30; // some driving, rest transit

        history.push({
          id: `calc-professional-${i}`,
          timestamp: date.toISOString(),
          persona: 'Professional',
          inputs: {
            persona: 'Professional',
            transportMethod: transportMethod,
            dailyDistance: dailyDistance,
            dietType: 'average_meat',
            electricityUsage: 300 * multiplier,
            electricityType: 'grid',
            shoppingHabits: i === 0 ? 'low' : 'moderate'
          },
          transportEmissions: Number(transportCalculated.toFixed(1)),
          foodEmissions: 75,
          energyEmissions: Number((baseEnergy * multiplier).toFixed(1)),
          lifestyleEmissions: i === 0 ? 30 : baseLifestyle,
          totalEmissions: Number((transportCalculated + 75 + (baseEnergy * multiplier) + (i === 0 ? 30 : baseLifestyle)).toFixed(1)),
          carbonScore: Math.round(55 - (multiplier - 1.0) * 15 + (i === 0 ? 15 : 0)),
          classification: 'Medium'
        });
      }
    } else if (persona === 'Family Household') {
      points = 90;
      streak = 0;
      completedChallenges = ['chal-3'];
      unlockedAchievements = ['Green Starter'];
      
      // Family: Very high emissions (heating/cooling, large car, high shopping), increasing trend (High Risk)
      const baseTransport = 162; // diesel car, 30 km/day
      const baseFood = 99; // omnivore/meat-heavy
      const baseEnergy = 240; // 600 kWh grid
      const baseLifestyle = 150; // high consumer

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
        // Emissons increase consistently due to higher power draw and more shopping
        const multiplier = 1.0 + (months - 1 - i) * 0.04; 
        
        history.push({
          id: `calc-family-${i}`,
          timestamp: date.toISOString(),
          persona: 'Family Household',
          inputs: {
            persona: 'Family Household',
            transportMethod: 'diesel_car',
            dailyDistance: 30,
            dietType: 'omnivore',
            electricityUsage: Math.round(600 * multiplier),
            electricityType: 'grid',
            shoppingHabits: 'high'
          },
          transportEmissions: baseTransport,
          foodEmissions: baseFood,
          energyEmissions: Number((baseEnergy * multiplier).toFixed(1)),
          lifestyleEmissions: baseLifestyle,
          totalEmissions: Number((baseTransport + baseFood + (baseEnergy * multiplier) + baseLifestyle).toFixed(1)),
          carbonScore: Math.max(10, Math.round(40 - (months - 1 - i) * 4)),
          classification: 'High'
        });
      }
    } else if (persona === 'Eco-Conscious User') {
      points = 650;
      streak = 12;
      completedChallenges = ['chal-1', 'chal-2', 'chal-3', 'chal-4', 'chal-5', 'chal-6'];
      unlockedAchievements = ['Green Starter', 'Climate Champion', 'Eco Hero'];

      // Eco-Conscious: Extremely low emissions (EV, vegan, green energy, minimalist), stable and very low
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
        history.push({
          id: `calc-eco-${i}`,
          timestamp: date.toISOString(),
          persona: 'Eco-Conscious User',
          inputs: {
            persona: 'Eco-Conscious User',
            transportMethod: 'ev',
            dailyDistance: 10,
            dietType: 'vegan',
            electricityUsage: 150,
            electricityType: 'green',
            shoppingHabits: 'low'
          },
          transportEmissions: 15, // EV emissions (10 * 0.05 * 30)
          foodEmissions: 45, // vegan
          energyEmissions: 3, // 150 kWh green (150 * 0.02)
          lifestyleEmissions: 30, // low
          totalEmissions: 93, // extremely low
          carbonScore: 94,
          classification: 'Low'
        });
      }
    }

    db.calculations = history;
    db.userStats = {
      points,
      streak,
      completedChallenges,
      unlockedAchievements,
      lastActive: now.toISOString()
    };

    // Add first audit log for seeding
    db.audits.push({
      id: `audit-seed-${Date.now()}`,
      eventType: 'DB_SEED',
      timestamp: now.toISOString(),
      userId: 'judge-user',
      metadata: {
        seededPersona: persona,
        recordsCreated: history.length
      }
    });

    await this.saveDb(db);
  }
};
