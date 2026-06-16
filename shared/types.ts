export type UserPersona = 'Student' | 'Professional' | 'Family Household' | 'Remote Worker' | 'Eco-Conscious User';

export type TransportMethod = 'petrol_car' | 'diesel_car' | 'ev' | 'public_transit' | 'walk_cycle';
export type DietType = 'omnivore' | 'average_meat' | 'pescatarian' | 'vegetarian' | 'vegan';
export type ElectricityType = 'grid' | 'green';
export type ShoppingHabits = 'high' | 'moderate' | 'low';

export interface CalculationInput {
  persona: UserPersona;
  transportMethod: TransportMethod;
  dailyDistance: number; // in km
  dietType: DietType;
  electricityUsage: number; // in kWh/month
  electricityType: ElectricityType;
  shoppingHabits: ShoppingHabits;
}

export interface CalculationResult {
  id: string;
  timestamp: string;
  persona: UserPersona;
  inputs: CalculationInput;
  transportEmissions: number; // kg CO2 / month
  foodEmissions: number; // kg CO2 / month
  energyEmissions: number; // kg CO2 / month
  lifestyleEmissions: number; // kg CO2 / month
  totalEmissions: number; // kg CO2 / month
  carbonScore: number; // 1 to 100 (higher is better/lower footprint)
  classification: 'Low' | 'Medium' | 'High';
}

export interface UserStats {
  points: number;
  streak: number;
  completedChallenges: string[];
  unlockedAchievements: string[];
  lastActive: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'Transportation' | 'Food' | 'Energy' | 'Lifestyle';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed?: boolean;
}

export interface Recommendation {
  id: string;
  action: string;
  category: 'Transportation' | 'Food' | 'Energy' | 'Lifestyle';
  annualCo2Savings: number; // kg
  annualSavings: number; // INR
  difficulty: 'Low' | 'Medium' | 'High';
  roi: 'Very High' | 'High' | 'Medium' | 'Low';
  priorityScore: number; // 0-100
  reason: string;
  impactScore: number; // 1-10
  costScore: number; // 0-10
  difficultyScore: number; // 1-10
  relevanceScore: number; // 1-10
  adoptionProbability: number; // 1-10
}

export interface ForecastPoint {
  month: string; // e.g. "Jun 2026", "Jul 2026"
  baseline: number; // kg CO2
  recommended: number; // kg CO2
  optimized: number; // kg CO2
}

export interface CarbonTwinData {
  currentEmissions: number;
  forecast: ForecastPoint[];
  confidence: 'High' | 'Medium' | 'Low';
  confidenceReason: string;
}

export interface BehavioralRiskData {
  riskLevel: 'Low' | 'Medium' | 'High';
  reason: string;
  metrics: {
    trendSlope: number;
    adoptionRate: number;
    challengeRate: number;
  };
}

export interface BenchmarkItem {
  label: string;
  value: number; // kg CO2 / month
  percentageDifference: number; // positive = worse, negative = better
}

export interface BenchmarkingData {
  userFootprint: number;
  personaAverage: number;
  regionalAverage: number;
  globalAverage: number;
  comparisons: BenchmarkItem[];
  communitySavings: number; // total kg saved by community
  ranking: number; // user rank in community
  totalUsers: number;
}

export interface ScenarioMilestone {
  month: number;
  actions: string[];
  monthlyCo2Reduction: number;
  monthlySavings: number;
}

export interface ScenarioPlan {
  goalType: 'reduction_10' | 'reduction_25' | 'money_10000' | 'top_20';
  targetDate: string;
  monthlySavingsGoal: number;
  monthlyCo2ReductionGoal: number;
  roadmap: ScenarioMilestone[];
  totalCo2Reduction: number;
  totalSavings: number;
  probability: number; // 0 to 100
  timeRequired: string; // e.g. "3 Months"
}

export interface WeeklyReport {
  id: string;
  timestamp: string;
  sustainabilityScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  trends: string;
  bestImprovement: string;
  biggestConcern: string;
  topRecommendation: string;
  carbonTwinProjections: string;
  formattedReport: string;
}

export interface AuditLog {
  id: string;
  eventType: string;
  timestamp: string;
  userId: string;
  metadata: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: string;
  ai_service: string;
  uptime: string;
  version: string;
  last_backup: string;
  environment: string;
  memoryUsage: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
  };
}

export interface SimulatedEmissions {
  transport: number;
  food: number;
  energy: number;
  lifestyle: number;
  total: number;
  score: number;
}

export interface SimulationResult {
  baseline: SimulatedEmissions;
  projected: SimulatedEmissions;
  monthlyReduction: number;
  annualReduction: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  footprint: number;
}

export interface BenchmarkResult {
  userFootprint: number;
  personaAverage: number;
  regionalAverage: number;
  globalAverage: number;
  comparisons: BenchmarkItem[];
  communitySavings: number;
  ranking: number;
  totalUsers: number;
  leaderboard: LeaderboardEntry[];
}

export interface RiskMetrics {
  trendSlope: number;
  adoptionRate: number;
  challengeRate: number;
}

export interface HistoryResult {
  history: CalculationResult[];
  stats: UserStats;
  risk: {
    level: 'Low' | 'Medium' | 'High';
    reason: string;
    metrics: RiskMetrics;
  };
}

export interface SystemConfig {
  ENABLE_AI: boolean;
  ENABLE_BENCHMARKING: boolean;
  ENABLE_SCENARIO_PLANNER: boolean;
  ENABLE_GAMIFICATION: boolean;
  ENABLE_CARBON_TWIN: boolean;
  GEMINI_STATUS: string;
}


