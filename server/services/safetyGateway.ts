import { CalculationInput } from '../../shared/types.js';

export const safetyGateway = {
  // Layer 1 & 2: Input Validation & Input Sanitization
  validateAndSanitizeInputs(inputs: CalculationInput): CalculationInput {
    // 1. Validation limits
    if (inputs.dailyDistance < 0 || inputs.dailyDistance > 10000) {
      throw new Error('Invalid travel distance. Must be between 0 and 10,000 km.');
    }
    if (inputs.electricityUsage < 0 || inputs.electricityUsage > 100000) {
      throw new Error('Invalid electricity usage. Must be between 0 and 100,000 kWh.');
    }

    // 2. Sanitization
    const sanitizeString = (str: string): string => {
      if (!str) return '';
      // Escape HTML tags to prevent XSS
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    };

    return {
      persona: sanitizeString(inputs.persona) as any,
      transportMethod: sanitizeString(inputs.transportMethod) as any,
      dailyDistance: Number(inputs.dailyDistance),
      dietType: sanitizeString(inputs.dietType) as any,
      electricityUsage: Number(inputs.electricityUsage),
      electricityType: sanitizeString(inputs.electricityType) as any,
      shoppingHabits: sanitizeString(inputs.shoppingHabits) as any
    };
  },

  // Layer 3: Prompt Risk Classification (Prompt Injection Defense)
  detectPromptInjection(text: string): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    
    // Blocklist of common prompt injection vectors
    const injectionKeywords = [
      'ignore previous instructions',
      'ignore the instructions above',
      'reveal system prompt',
      'show system prompt',
      'system override',
      'reveal api key',
      'show api key',
      'bypass restrictions',
      'execute code',
      'you are now a',
      'act as',
      'prompt injection',
      'system prompt leak'
    ];

    return injectionKeywords.some((keyword) => lowerText.includes(keyword));
  },

  // Layer 5 & 6: AI Output Validation & Response Sanitization
  sanitizeAIOutput<T>(output: T): T {
    if (!output) return output;

    const sanitizeVal = (val: any): any => {
      if (typeof val === 'string') {
        // Strip out script tags and their contents, and all other HTML tags
        return val.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '').replace(/<[^>]*>/g, '');
      }
      if (Array.isArray(val)) {
        return val.map(sanitizeVal);
      }
      if (typeof val === 'object' && val !== null) {
        const cleaned: Record<string, any> = {};
        for (const key in val) {
          cleaned[key] = sanitizeVal(val[key]);
        }
        return cleaned as any;
      }
      return val;
    };

    return sanitizeVal(output);
  }
};
