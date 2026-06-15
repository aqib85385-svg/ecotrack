import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  console.error('Express Error Handler caught exception:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Security: Never leak stack traces in production (we'll check env variable)
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(status).json({
    error: isProduction ? 'An internal error occurred. Please contact the administrator.' : message,
    status,
    ...(isProduction ? {} : { stack: err.stack })
  });
}
