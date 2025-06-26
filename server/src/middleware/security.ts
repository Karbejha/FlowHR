import { Request, Response, NextFunction } from 'express';

// Security middleware to add security headers and sanitize responses
export const addSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent exposing server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add cache control for sensitive endpoints
  if (req.path.includes('/auth/') || req.path.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

// Middleware to prevent sensitive data leakage in error responses
export const sanitizeErrorResponse = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let errorMessage = 'Internal server error';
  let statusCode = 500;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorMessage = 'Validation error';
    statusCode = 400;
  } else if (err.name === 'CastError') {
    errorMessage = 'Invalid ID format';
    statusCode = 400;
  } else if (err.code === 11000) {
    errorMessage = 'Duplicate field value';
    statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    errorMessage = 'Invalid token';
    statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    errorMessage = 'Token expired';
    statusCode = 401;
  }
  
  // Log the full error for debugging but don't expose it
  console.error('Error:', err);
  
  res.status(statusCode).json({
    error: errorMessage,
    ...(isDevelopment && { details: err.message, stack: err.stack })
  });
};

// Middleware to sanitize request data
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove any potentially dangerous fields from request body
  if (req.body) {
    // Remove fields that should never be set directly by users
    delete req.body.__v;
    delete req.body._id;
    delete req.body.createdAt;
    delete req.body.updatedAt;
    
    // For user updates, ensure password isn't accidentally included
    if (req.path.includes('/users/') && req.method === 'PUT') {
      delete req.body.password; // Password should be updated through dedicated endpoint
    }
  }
  
  next();
};
