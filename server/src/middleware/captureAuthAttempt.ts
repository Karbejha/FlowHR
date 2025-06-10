import { Request, Response, NextFunction } from 'express';

// Middleware to capture attempted email and client IP for failed auth requests
export const captureAuthAttempt = (req: Request, res: Response, next: NextFunction) => {
  // Store the original json method
  const originalJson = res.json;
  
  // Override res.json to capture failed auth attempts
  res.json = function(body: any) {
    // If this is an auth endpoint and the response is an error
    if (req.originalUrl.includes('/auth/') && res.statusCode >= 400) {
      // Store attempted email and client IP in request for morgan to pick up
      if (req.body && req.body.email) {
        (req as any).attemptedEmail = req.body.email;
      }
      // Store client IP for security logging
      (req as any).authAttemptIp = (req as any).clientIp || req.ip || 'unknown';
    }
    
    // Call the original json method
    return originalJson.call(this, body);
  };
  
  next();
};
