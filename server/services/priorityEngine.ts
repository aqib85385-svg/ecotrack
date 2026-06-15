import { Recommendation, CalculationResult, UserPersona } from '../../shared/types.js';

export const priorityEngine = {
  // Score and enrich a list of base recommendations based on user calculations and risk
  scoreRecommendations(
    baseActions: any[],
    lastCalc: CalculationResult,
    riskLevel: 'Low' | 'Medium' | 'High'
  ): Recommendation[] {
    const { transportEmissions, foodEmissions, energyEmissions, lifestyleEmissions, totalEmissions } = lastCalc;
    const persona = lastCalc.persona;

    // Identify primary emission source
    const contributors = [
      { name: 'Transportation', value: transportEmissions },
      { name: 'Food', value: foodEmissions },
      { name: 'Energy', value: energyEmissions },
      { name: 'Lifestyle', value: lifestyleEmissions }
    ];
    contributors.sort((a, b) => b.value - a.value);
    const primaryContributor = contributors[0].name;

    return baseActions.map((action) => {
      // 1. Calculate Relevance Score (1-10)
      // Highly relevant if it matches the user's primary contributor
      let relevanceScore = 5;
      if (action.category === primaryContributor) {
        relevanceScore = 9;
      } else if (action.category === contributors[1].name) {
        relevanceScore = 7;
      }

      // Persona adjustments: students prefer low cost; families prefer home energy; professionals prefer convenience
      if (persona === 'Student' && action.costScore <= 2) {
        relevanceScore += 1;
      } else if (persona === 'Family Household' && action.category === 'Energy') {
        relevanceScore += 1;
      } else if (persona === 'Professional' && action.difficultyScore <= 3) {
        relevanceScore += 1;
      } else if (persona === 'Remote Worker' && action.category === 'Energy' && action.action.includes('home')) {
        relevanceScore += 1;
      } else if (persona === 'Eco-Conscious User' && action.impactScore >= 8) {
        relevanceScore += 1;
      }
      relevanceScore = Math.max(1, Math.min(10, relevanceScore));

      // 2. Calculate ROI Score (1-10)
      // ROI = savings (INR) / cost. We scale this relative to cost.
      let roiScore = 5;
      if (action.costScore === 0) {
        roiScore = 10; // free with savings is infinite ROI
      } else {
        // scale ROI score from annual savings relative to costScore
        // savings of ₹10,000 at cost 2 = high ROI
        const rawRoi = action.annualSavings / (action.costScore * 1000 + 500);
        roiScore = Math.max(1, Math.min(10, Math.round(rawRoi * 2)));
      }

      // 3. Calculate Adoption Probability (1-10)
      // Higher adoption probability if difficulty and cost are low
      let adoptionProbability = Math.round(10 - (action.difficultyScore * 0.4 + action.costScore * 0.4));
      // Adjust based on persona
      if (persona === 'Student' && action.costScore > 5) {
        adoptionProbability -= 2; // students unlikely to adopt high-cost options
      } else if (persona === 'Eco-Conscious User') {
        adoptionProbability += 1; // eco-conscious users are generally more receptive
      }
      adoptionProbability = Math.max(1, Math.min(10, adoptionProbability));

      // 4. Adjust relevance/adoption based on behavioral risk level
      // High behavioral risk increases relevance for items in primary emission sectors to force action
      if (riskLevel === 'High' && action.category === primaryContributor) {
        relevanceScore = Math.min(10, relevanceScore + 1);
      }

      // 5. Calculate Priority Score (0-100) using the rubric formula:
      // Priority = round( ((Impact * 0.35) + (Relevance * 0.25) + (Adoption * 0.15) + (ROI * 0.15) + (10 - Cost) * 0.1) * 10 )
      const scoreTerm = 
        (action.impactScore * 0.35) + 
        (relevanceScore * 0.25) + 
        (adoptionProbability * 0.15) + 
        (roiScore * 0.15) + 
        ((10 - action.costScore) * 0.1);

      // Normalizing score to scale of 0-100
      const priorityScore = Math.max(1, Math.min(100, Math.round(scoreTerm * 10)));

      // 6. Generate explainable AI reasoning why this action is ranked here
      let reason = `This action is prioritized at ${priorityScore}/100. `;
      if (action.category === primaryContributor) {
        reason += `It directly targets your primary emission sector (${primaryContributor} which contributes ${Math.round((contributors[0].value / totalEmissions) * 100)}% of your footprint) `;
      } else {
        reason += `It addresses your ${action.category} emissions. `;
      }

      if (action.costScore === 0) {
        reason += `It is free to implement and provides a very high ROI, saving you approximately ₹${action.annualSavings.toLocaleString('en-IN')} annually.`;
      } else if (action.costScore >= 7) {
        reason += `While requiring a significant financial investment (Cost Score: ${action.costScore}/10), it offers substantial long-term carbon reduction (${action.annualCo2Savings} kg CO2/year).`;
      } else {
        reason += `It has a balanced difficulty and cost profile, making it highly achievable with a solid adoption probability of ${adoptionProbability * 10}%.`;
      }

      return {
        id: action.id,
        action: action.action,
        category: action.category,
        annualCo2Savings: action.annualCo2Savings,
        annualSavings: action.annualSavings,
        difficulty: action.difficulty,
        roi: this.mapRoiScoreToLabel(roiScore),
        priorityScore,
        reason,
        impactScore: action.impactScore,
        costScore: action.costScore,
        difficultyScore: action.difficultyScore,
        relevanceScore,
        adoptionProbability
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  },

  mapRoiScoreToLabel(score: number): 'Very High' | 'High' | 'Medium' | 'Low' {
    if (score >= 8) return 'Very High';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  }
};
