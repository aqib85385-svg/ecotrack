import type {
  CalculationInput,
  CalculationResult,
  UserStats,
  Challenge,
  Recommendation,
  CarbonTwinData,
  WeeklyReport,
  ScenarioPlan,
  AuditLog,
  UserPersona,
  SimulationResult,
  HistoryResult,
  BenchmarkResult
} from '../../shared/types.js';

async function fetchHelper<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Config and Feature Flags
  async getConfig(): Promise<{
    ENABLE_AI: boolean;
    ENABLE_BENCHMARKING: boolean;
    ENABLE_SCENARIO_PLANNER: boolean;
    ENABLE_GAMIFICATION: boolean;
    ENABLE_CARBON_TWIN: boolean;
    GEMINI_STATUS: string;
  }> {
    return fetchHelper('/api/config');
  },

  // Footprint Calculator
  async calculate(inputs: CalculationInput): Promise<CalculationResult> {
    return fetchHelper('/api/footprint/calculate', {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  },

  // AI Coach & Recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    return fetchHelper('/api/coach/recommendations');
  },

  async generateReport(): Promise<WeeklyReport> {
    return fetchHelper('/api/coach/report', {
      method: 'POST'
    });
  },

  async getReports(): Promise<WeeklyReport[]> {
    return fetchHelper('/api/coach/report/history');
  },

  // Impact Simulator
  async simulate(params: {
    switchTransit: boolean;
    reduceElectricityPct: number;
    newDietType: string;
    newShoppingHabits: string;
  }): Promise<SimulationResult> {
    return fetchHelper('/api/simulator/simulate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Progress Tracker & History
  async getHistory(): Promise<HistoryResult> {
    return fetchHelper('/api/tracker/history');
  },

  // Carbon Twin
  async getTwin(): Promise<CarbonTwinData> {
    return fetchHelper('/api/tracker/twin');
  },

  // Benchmarking
  async getBenchmark(): Promise<BenchmarkResult> {
    return fetchHelper('/api/benchmarking/compare');
  },

  // Challenges
  async listChallenges(): Promise<Challenge[]> {
    return fetchHelper('/api/challenges/list');
  },

  async completeChallenge(id: string): Promise<{
    message: string;
    stats: UserStats;
  }> {
    return fetchHelper(`/api/challenges/${id}/complete`, {
      method: 'POST'
    });
  },

  // Scenario Planner
  async generatePlan(goalType: string): Promise<ScenarioPlan> {
    return fetchHelper('/api/scenario/plan', {
      method: 'POST',
      body: JSON.stringify({ goalType })
    });
  },

  // Audit Logging
  async getAuditLogs(): Promise<AuditLog[]> {
    return fetchHelper('/api/audit/logs');
  },

  // Judge Demo Seeder
  async seedDemo(persona: UserPersona): Promise<{ message: string }> {
    return fetchHelper('/api/demo/seed', {
      method: 'POST',
      body: JSON.stringify({ persona })
    });
  }
};
