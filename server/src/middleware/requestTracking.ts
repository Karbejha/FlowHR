import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// Middleware to add unique request ID to each request
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Middleware to add response time
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Use a hook to capture response time just before headers are sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log the response time instead of trying to set headers after response is sent
    if (req.requestId) {
      // This will be logged by Morgan middleware instead
      (req as any).responseTime = duration;
    }
  });
  
  next();
};
