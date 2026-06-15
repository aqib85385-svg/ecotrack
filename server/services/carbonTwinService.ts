import { CalculationResult, CarbonTwinData, ForecastPoint } from '../../shared/types.js';

export const carbonTwinService = {
  generateForecast(history: CalculationResult[]): CarbonTwinData {
    if (history.length === 0) {
      return {
        currentEmissions: 0,
        forecast: [],
        confidence: 'Low',
        confidenceReason: 'No historical calculation logs available. Please input your footprint details to generate your Carbon Twin.'
      };
    }

    // Sort history chronologically
    const sortedHistory = history
      .slice()
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const currentEmissions = sortedHistory[sortedHistory.length - 1].totalEmissions;

    // 1. Calculate Confidence level
    const { confidence, confidenceReason } = this.calculateConfidence(sortedHistory);

    // 2. Extrapolate slope
    let slope = 0;
    if (sortedHistory.length >= 2) {
      const yDiff = sortedHistory[sortedHistory.length - 1].totalEmissions - sortedHistory[0].totalEmissions;
      // time difference in months (approx)
      const firstDate = new Date(sortedHistory[0].timestamp);
      const lastDate = new Date(sortedHistory[sortedHistory.length - 1].timestamp);
      const diffMs = lastDate.getTime() - firstDate.getTime();
      const diffMonths = Math.max(1, diffMs / (1000 * 60 * 60 * 24 * 30.4));
      slope = yDiff / diffMonths;
    }

    // Bound slope to avoid extreme extrapolation
    slope = Math.max(-50, Math.min(50, slope));

    // 3. Generate forecasts for 1, 6, and 12 months
    const forecastMonths = [1, 6, 12];
    const forecast: ForecastPoint[] = [];

    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Define monthly savings percentages for Recommended and Optimized paths
    const recommendedSavingPct = 0.20; // 20% savings if adopting key actions
    const optimizedSavingPct = 0.40;   // 40% savings if adopting all options

    forecastMonths.forEach((m) => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + m, 15);
      const label = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

      // Seasonal fluctuation (sinusoidal, peaking in summer/winter due to HVAC, minor impact ±5%)
      const seasonalFactor = 1 + 0.05 * Math.sin((targetDate.getMonth() / 12) * 2 * Math.PI);

      // Baseline projection: current + slope * months, with seasonal fluctuations
      let baseline = currentEmissions + slope * m;
      baseline = Math.max(50, baseline * seasonalFactor); // bound to minimum of 50 kg CO2/month

      // Recommended projection: assumes progressive adoption of priority recommendations (reduces baseline by e.g. 20% over 6 months)
      // Transition rate: reaches full savings at month 6
      const recFactor = 1 - Math.min(recommendedSavingPct, (m / 6) * recommendedSavingPct);
      const recommended = Math.max(40, baseline * recFactor);

      // Optimized projection: assumes aggressive adoption (reduces baseline by e.g. 40% over 12 months)
      const optFactor = 1 - Math.min(optimizedSavingPct, (m / 12) * optimizedSavingPct);
      const optimized = Math.max(30, baseline * optFactor);

      forecast.push({
        month: label,
        baseline: Number(baseline.toFixed(1)),
        recommended: Number(recommended.toFixed(1)),
        optimized: Number(optimized.toFixed(1))
      });
    });

    return {
      currentEmissions,
      forecast,
      confidence,
      confidenceReason
    };
  },

  calculateConfidence(history: CalculationResult[]): { confidence: 'High' | 'Medium' | 'Low'; confidenceReason: string } {
    if (history.length === 1) {
      return {
        confidence: 'Low',
        confidenceReason: 'Confidence is Low because your profile contains only 1 footprint calculation log. More entries are required to build a stable historical baseline.'
      };
    }

    const firstDate = new Date(history[0].timestamp);
    const lastDate = new Date(history[history.length - 1].timestamp);
    const timeSpanDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate variance
    const emissions = history.map((h) => h.totalEmissions);
    const mean = emissions.reduce((sum, v) => sum + v, 0) / emissions.length;
    const variance = emissions.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / emissions.length;
    const stdDev = Math.sqrt(variance);
    const relativeStdDev = mean > 0 ? stdDev / mean : 0;

    if (history.length >= 5 && timeSpanDays >= 45 && relativeStdDev <= 0.15) {
      return {
        confidence: 'High',
        confidenceReason: `Confidence is High. You have logged ${history.length} data points consistently over ${Math.round(timeSpanDays)} days, showing stable behavioral patterns.`
      };
    }

    if (history.length >= 3 && relativeStdDev <= 0.3) {
      return {
        confidence: 'Medium',
        confidenceReason: `Confidence is Medium. There are ${history.length} logs over ${Math.round(timeSpanDays)} days. Extrapolations are stable, but logging over a longer period will increase confidence.`
      };
    }

    return {
      confidence: 'Low',
      confidenceReason: `Confidence is Low. Your calculations show high volatility (variance of ${Math.round(relativeStdDev * 100)}%) or history is recorded over a short period. Stable inputs will improve accuracy.`
    };
  }
};
