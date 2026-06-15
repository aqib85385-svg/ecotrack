import { Request, Response, NextFunction } from 'express';
import { safetyGateway } from '../services/safetyGateway.js';

export function securityFilter(req: Request, res: Response, next: NextFunction) {
  // 1. Check for prompt injection in all string values in req.body
  const checkValues = (obj: any): boolean => {
    if (!obj) return false;
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string') {
        if (safetyGateway.detectPromptInjection(val)) {
          return true;
        }
      } else if (typeof val === 'object' && val !== null) {
        if (checkValues(val)) return true;
      }
    }
    return false;
  };

  if (checkValues(req.body)) {
    return res.status(400).json({
      error: 'Security Alert: Request rejected. Malicious prompt injection pattern or system override attempt detected.'
    });
  }

  // 2. Escape HTML tags in all string inputs recursively
  const sanitizeValues = (obj: any): any => {
    if (!obj) return obj;
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string') {
        obj[key] = val
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      } else if (typeof val === 'object' && val !== null) {
        obj[key] = sanitizeValues(val);
      }
    }
    return obj;
  };

  req.body = sanitizeValues(req.body);
  next();
}
