import { CalculationResult, UserStats, BehavioralRiskData } from '../../shared/types.js';

export const riskEngineService = {
  calculateRisk(history: CalculationResult[], stats: UserStats): BehavioralRiskData {
    if (history.length === 0) {
      return {
        riskLevel: 'Medium',
        reason: 'Insufficient history. Complete your first carbon footprint log to initialize risk tracking.',
        metrics: { trendSlope: 0, adoptionRate: 0, challengeRate: 0 }
      };
    }

    // 1. Calculate challenge completion rate (completed out of total database challenges, say 6)
    const completedCount = stats.completedChallenges?.length || 0;
    const totalChallenges = 6; // base total challenges in db.json
    const challengeRate = completedCount / totalChallenges;

    // 2. Calculate trend slope (linear regression slope of last 3 calculations if available)
    const recentHistory = history
      .slice()
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-3);

    let trendSlope = 0;
    if (recentHistory.length >= 2) {
      const yDiff = recentHistory[recentHistory.length - 1].totalEmissions - recentHistory[0].totalEmissions;
      const xDiff = recentHistory.length - 1;
      trendSlope = Number((yDiff / xDiff).toFixed(2));
    }

    // 3. Estimate recommendation adoption rate
    // If emissions are declining, we assume higher adoption rate. If they are rising, we assume low.
    let adoptionRate = 0.5; // neutral default
    if (trendSlope < -5) {
      adoptionRate = 0.85; // high adoption
    } else if (trendSlope > 5) {
      adoptionRate = 0.15; // low adoption
    } else if (recentHistory.length >= 2) {
      adoptionRate = 0.5 - (trendSlope * 0.03); // scaled
      adoptionRate = Math.max(0, Math.min(1, adoptionRate));
    }

    // 4. Risk level determination
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
    let reason = 'Your carbon footprint is stable. To reduce risk further, complete more weekly eco-challenges.';

    // Risk triggers
    const consecutiveIncreases = this.checkConsecutiveIncreases(recentHistory);
    
    if (consecutiveIncreases || (trendSlope > 10 && challengeRate < 0.2)) {
      riskLevel = 'High';
      reason = consecutiveIncreases 
        ? 'Your monthly carbon emissions have increased consecutively for recent periods and action items remain unadopted.'
        : 'Your emissions are trending upward rapidly and your eco-challenge engagement is low.';
    } else if (trendSlope < -2 && challengeRate >= 0.4) {
      riskLevel = 'Low';
      reason = 'Excellent! Your emissions are steadily declining, and you are actively completing challenges.';
    } else if (trendSlope > 2) {
      riskLevel = 'Medium';
      reason = 'Warning: Your emissions have shown an upward trend recently. Consider adopting high-priority transport or energy actions.';
    }

    return {
      riskLevel,
      reason,
      metrics: {
        trendSlope,
        adoptionRate: Number(adoptionRate.toFixed(2)),
        challengeRate: Number(challengeRate.toFixed(2))
      }
    };
  },

  checkConsecutiveIncreases(recent: CalculationResult[]): boolean {
    if (recent.length < 3) return false;
    // index 0 -> index 1 -> index 2
    return recent[1].totalEmissions > recent[0].totalEmissions && 
           recent[2].totalEmissions > recent[1].totalEmissions;
  }
};
