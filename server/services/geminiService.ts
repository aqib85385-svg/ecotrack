import { GoogleGenerativeAI } from '@google/generative-ai';
import { CalculationResult, Recommendation, WeeklyReport } from '../../shared/types.js';
import { priorityEngine } from './priorityEngine.js';

// Base database of local recommendations for fallback
const BASE_RECOMENDATIONS = [
  { id: 'rec-1', action: 'Switch to Metro or Public Transit', category: 'Transportation', annualCo2Savings: 600, annualSavings: 18000, difficulty: 'Low', impactScore: 8, costScore: 2, difficultyScore: 2 },
  { id: 'rec-2', action: 'Walk or Cycle for Short Trips (< 3km)', category: 'Transportation', annualCo2Savings: 150, annualSavings: 4500, difficulty: 'Low', impactScore: 4, costScore: 0, difficultyScore: 1 },
  { id: 'rec-3', action: 'Carpool with Coworkers or Peers', category: 'Transportation', annualCo2Savings: 350, annualSavings: 12000, difficulty: 'Low', impactScore: 6, costScore: 1, difficultyScore: 2 },
  { id: 'rec-4', action: 'Transition to an Electric Vehicle (EV)', category: 'Transportation', annualCo2Savings: 1800, annualSavings: 48000, difficulty: 'High', impactScore: 10, costScore: 9, difficultyScore: 7 },
  { id: 'rec-5', action: 'Adopt 2 Vegetarian Days per Week', category: 'Food', annualCo2Savings: 180, annualSavings: 5000, difficulty: 'Low', impactScore: 5, costScore: 1, difficultyScore: 2 },
  { id: 'rec-6', action: 'Adopt a Fully Plant-Based Diet', category: 'Food', annualCo2Savings: 450, annualSavings: 12000, difficulty: 'Medium', impactScore: 8, costScore: 2, difficultyScore: 5 },
  { id: 'rec-7', action: 'Install LED Bulbs and Smart Outlets', category: 'Energy', annualCo2Savings: 120, annualSavings: 3000, difficulty: 'Low', impactScore: 3, costScore: 2, difficultyScore: 1 },
  { id: 'rec-8', action: 'Reduce AC/Heating Temperature by 2°C', category: 'Energy', annualCo2Savings: 280, annualSavings: 6500, difficulty: 'Low', impactScore: 6, costScore: 0, difficultyScore: 2 },
  { id: 'rec-9', action: 'Install Residential Solar Panels', category: 'Energy', annualCo2Savings: 2400, annualSavings: 28000, difficulty: 'High', impactScore: 10, costScore: 8, difficultyScore: 8 },
  { id: 'rec-10', action: 'Buy Second-Hand / Refurbished Electronics', category: 'Lifestyle', annualCo2Savings: 150, annualSavings: 15000, difficulty: 'Low', impactScore: 4, costScore: 1, difficultyScore: 2 },
  { id: 'rec-11', action: 'Practice Minimalist Shopping Habits', category: 'Lifestyle', annualCo2Savings: 300, annualSavings: 25000, difficulty: 'Medium', impactScore: 7, costScore: 0, difficultyScore: 4 }
];

export const geminiService = {
  // Generate recommendations
  async getRecommendations(
    lastCalc: CalculationResult,
    riskLevel: 'Low' | 'Medium' | 'High'
  ): Promise<Recommendation[]> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey === '') {
      console.log('No GEMINI_API_KEY provided. Using local deterministic prioritization fallback.');
      return priorityEngine.scoreRecommendations(BASE_RECOMENDATIONS, lastCalc, riskLevel);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are a senior environmental scientist and sustainability coach.
        Analyze this carbon footprint calculation result for a user with persona "${lastCalc.persona}":
        - Total emissions: ${lastCalc.totalEmissions} kg CO2/month
        - Transportation: ${lastCalc.transportEmissions} kg CO2/month (method: ${lastCalc.inputs.transportMethod}, daily distance: ${lastCalc.inputs.dailyDistance} km)
        - Diet: ${lastCalc.foodEmissions} kg CO2/month (diet type: ${lastCalc.inputs.dietType})
        - Energy/Electricity: ${lastCalc.energyEmissions} kg CO2/month (usage: ${lastCalc.inputs.electricityUsage} kWh, type: ${lastCalc.inputs.electricityType})
        - Lifestyle/Shopping: ${lastCalc.lifestyleEmissions} kg CO2/month (habits: ${lastCalc.inputs.shoppingHabits})
        - Behavioral Risk Level: ${riskLevel}

        Generate exactly 4-6 personalized, high-impact recommendations.
        You must return a raw JSON array matching this structure (no markdown fences, no formatting tags, just pure JSON):
        [
          {
            "id": "string (unique code like rec-1)",
            "action": "string (concise title, e.g., 'Switch to Metro')",
            "category": "string (one of 'Transportation' | 'Food' | 'Energy' | 'Lifestyle')",
            "annualCo2Savings": number (estimated kg CO2 saved annually),
            "annualSavings": number (estimated financial savings in INR annually),
            "difficulty": "string ('Low' | 'Medium' | 'High')",
            "impactScore": number (1 to 10),
            "costScore": number (0 to 10, where 0 is free, 10 is very expensive),
            "difficultyScore": number (1 to 10),
            "reason": "string (clear, user-specific explanation of why this action is prioritized, referencing their primary emissions)"
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      // Safety gateway parser: clean markdown backticks if returned
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const aiActions = JSON.parse(cleanJson);
      
      // Enrich using local priority engine rules to ensure scoring compliance
      return priorityEngine.scoreRecommendations(aiActions, lastCalc, riskLevel);
    } catch (err) {
      console.error('Gemini API call failed, falling back to local recommendation engine:', err);
      return priorityEngine.scoreRecommendations(BASE_RECOMENDATIONS, lastCalc, riskLevel);
    }
  },

  // Generate weekly sustainability report
  async generateWeeklyReport(
    history: CalculationResult[],
    riskLevel: 'Low' | 'Medium' | 'High',
    stats: any,
    recommendations: Recommendation[]
  ): Promise<WeeklyReport> {
    const lastCalc = history[history.length - 1];
    const score = lastCalc?.carbonScore || 50;

    const localReport: WeeklyReport = {
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sustainabilityScore: score,
      riskLevel: riskLevel,
      trends: history.length >= 2 
        ? `Your emissions changed from ${history[history.length - 2].totalEmissions} to ${lastCalc.totalEmissions} kg CO2/month.`
        : 'Initialize calculation history to establish carbon trends.',
      bestImprovement: lastCalc?.energyEmissions < 100 ? 'Low electricity usage' : 'Stable baseline emissions',
      biggestConcern: lastCalc?.transportEmissions > 200 ? 'High transportation emissions from driving' : 'None',
      topRecommendation: recommendations[0]?.action || 'Use public transport',
      carbonTwinProjections: `Based on your ${riskLevel} Risk status, your 12-month Carbon Twin projects emissions at ${lastCalc ? (lastCalc.totalEmissions * 12).toFixed(0) : 'N/A'} kg CO2/year if habits remain unchanged.`,
      formattedReport: `### Weekly Sustainability Report
- **Carbon Score**: ${score}/100
- **Risk Level**: ${riskLevel}
- **Emission Trend**: ${history.length >= 2 ? 'Calculated over your last logs.' : 'N/A'}
- **Action Required**: Adopt "${recommendations[0]?.action || 'sustainable transit'}" to save up to ${recommendations[0]?.annualCo2Savings || 600} kg CO2/year.`
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey === '') {
      console.log('No GEMINI_API_KEY provided. Using local reports fallback.');
      return localReport;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are an AI Sustainability Coach.
        Write a structured report based on this user profile:
        - History: ${JSON.stringify(history.slice(-3).map(h => ({ date: h.timestamp, total: h.totalEmissions })))}
        - Risk Level: ${riskLevel}
        - Current Score: ${score}/100
        - Best recommendation: ${recommendations[0]?.action} (saves ${recommendations[0]?.annualCo2Savings} kg CO2/year)

        You must return a raw JSON object matching this structure (no markdown, no formatting tags, just JSON):
        {
          "trends": "string summary of recent trends",
          "bestImprovement": "string detailing user's best area",
          "biggestConcern": "string detailing user's highest emission concern",
          "topRecommendation": "string recommended next action",
          "carbonTwinProjections": "string description of projected 12-month emissions",
          "formattedReport": "string (detailed markdown report containing lists, tips, and encouraging notes)"
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const reportContent = JSON.parse(cleanJson);

      return {
        id: `rep-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sustainabilityScore: score,
        riskLevel: riskLevel,
        trends: reportContent.trends || localReport.trends,
        bestImprovement: reportContent.bestImprovement || localReport.bestImprovement,
        biggestConcern: reportContent.biggestConcern || localReport.biggestConcern,
        topRecommendation: reportContent.topRecommendation || localReport.topRecommendation,
        carbonTwinProjections: reportContent.carbonTwinProjections || localReport.carbonTwinProjections,
        formattedReport: reportContent.formattedReport || localReport.formattedReport
      };
    } catch (err) {
      console.error('Gemini report call failed, using local report fallback:', err);
      return localReport;
    }
  }
};
