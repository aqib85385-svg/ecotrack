import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geminiService } from '../server/services/geminiService.js';

const mockGenerateContent = vi.fn();

// Mock the GoogleGenerativeAI class and methods
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockImplementation(() => {
          return {
            generateContent: mockGenerateContent
          };
        })
      };
    })
  };
});

describe('Gemini Service Layer', () => {
  const originalEnvKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnvKey;
  });

  const mockCalc = {
    id: 'calc-1',
    timestamp: '2026-06-16T12:00:00.000Z',
    persona: 'Student',
    inputs: {
      persona: 'Student',
      transportMethod: 'public_transit',
      dailyDistance: 10,
      dietType: 'vegan',
      electricityUsage: 120,
      electricityType: 'green',
      shoppingHabits: 'low'
    },
    transportEmissions: 10,
    foodEmissions: 45,
    energyEmissions: 3,
    lifestyleEmissions: 30,
    totalEmissions: 88,
    carbonScore: 90,
    classification: 'Low'
  };

  describe('getRecommendations', () => {
    it('uses local fallback when API key is missing, empty or PLACEHOLDER', async () => {
      process.env.GEMINI_API_KEY = '';
      const recs = await geminiService.getRecommendations(mockCalc as any, 'Low');
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].id).toContain('rec-');
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('returns structured recommendations from Gemini response on success', async () => {
      process.env.GEMINI_API_KEY = 'valid_secret_key';
      
      const mockAiResponse = [
        {
          id: 'rec-custom-1',
          action: 'Plant a local tree',
          category: 'Lifestyle',
          annualCo2Savings: 50,
          annualSavings: 1000,
          difficulty: 'Low',
          impactScore: 5,
          costScore: 1,
          difficultyScore: 1,
          reason: 'Slashes timeline carbon footprint.'
        }
      ];

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockAiResponse)
        }
      });

      const recs = await geminiService.getRecommendations(mockCalc as any, 'Low');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(recs.length).toBe(1);
      expect(recs[0].action).toBe('Plant a local tree');
    });

    it('falls back to local rules when Gemini API call throws an exception', async () => {
      process.env.GEMINI_API_KEY = 'valid_secret_key';
      mockGenerateContent.mockRejectedValue(new Error('Network connection timeout'));

      const recs = await geminiService.getRecommendations(mockCalc as any, 'Low');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].id).toContain('rec-'); // fallback triggered
    });
  });

  describe('generateWeeklyReport', () => {
    const mockRecs = [
      { id: 'rec-1', action: 'Take train', category: 'Transportation', annualCo2Savings: 300 }
    ];

    it('uses local report fallback when API key is missing or placeholder', async () => {
      process.env.GEMINI_API_KEY = '';
      const report = await geminiService.generateWeeklyReport([mockCalc] as any, 'Low', {}, mockRecs as any);
      expect(report.sustainabilityScore).toBe(90);
      expect(report.topRecommendation).toBe('Take train');
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('returns custom synthesized report from Gemini response on success', async () => {
      process.env.GEMINI_API_KEY = 'valid_secret_key';

      const mockAiReport = {
        trends: 'Emissions are down 12%.',
        bestImprovement: 'Lowering travel miles',
        biggestConcern: 'Meat eating',
        topRecommendation: 'Go pescatarian',
        carbonTwinProjections: 'Optimized timeline ahead.',
        formattedReport: '# Weekly Custom Sustainability Report'
      };

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockAiReport)
        }
      });

      const report = await geminiService.generateWeeklyReport([mockCalc] as any, 'Low', {}, mockRecs as any);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(report.trends).toBe('Emissions are down 12%.');
      expect(report.bestImprovement).toBe('Lowering travel miles');
      expect(report.formattedReport).toBe('# Weekly Custom Sustainability Report');
    });

    it('falls back to local report when Gemini API call fails', async () => {
      process.env.GEMINI_API_KEY = 'valid_secret_key';
      mockGenerateContent.mockRejectedValue(new Error('Quota limit exceeded'));

      const report = await geminiService.generateWeeklyReport([mockCalc] as any, 'Low', {}, mockRecs as any);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(report.sustainabilityScore).toBe(90);
      expect(report.topRecommendation).toBe('Take train'); // fallback
    });
  });
});
