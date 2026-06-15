import rateLimit from 'express-rate-limit';

// Standard rate limiter for general api routes
export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Limit relaxed for dev/test
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Tight rate limiter for Gemini AI coach calls
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 1000, // Limit relaxed for dev/test
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI Generation limit exceeded. Please wait 15 minutes before making another request.'
  }
});
