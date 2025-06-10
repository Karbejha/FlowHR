import { Request, Response, NextFunction } from 'express';
import { logUserError, logSecurityEvent } from '../utils/logger';

// Enhanced error handler with user tracking
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const userAgent = req.get('User-Agent');
  const ip = (req as any).clientIp || req.ip || req.connection.remoteAddress;

  // Prepare error context
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    ip,
    userAgent,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: {
      'content-type': req.get('Content-Type'),
      'origin': req.get('Origin'),
      'referer': req.get('Referer')
    }
  };
  // Log error with user context if user is authenticated
  if (user) {
    logUserError(
      `Application error: ${err.message}`,
      err,
      user.id,
      user.email,
      user.role,
      errorContext,
      ip
    );

    // Log security events for suspicious activities
    if (err.status === 403 || err.status === 401) {
      logSecurityEvent(
        'Unauthorized access attempt',
        'medium',
        user.id,
        user.email,
        {
          ...errorContext,
          errorStatus: err.status,
          errorMessage: err.message
        },
        ip
      );
    }
  } else {
    // Log error without user context for anonymous requests
    logUserError(
      `Anonymous error: ${err.message}`,
      err,
      undefined,
      undefined,
      undefined,
      errorContext,
      ip
    );

    // Log potential security threats from anonymous users
    if (err.status === 403 || err.status === 401) {
      logSecurityEvent(
        'Anonymous unauthorized access attempt',
        'high',
        undefined,
        undefined,
        {
          ...errorContext,
          errorStatus: err.status,
          errorMessage: err.message
        },
        ip
      );
    }
  }

  // Determine response based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
};

// Middleware to track user actions
export const userActionLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log successful actions
      if (res.statusCode < 400 && req.user) {        import('../utils/logger').then(({ logUserAction }) => {
          logUserAction(
            `User action: ${action}`,
            req.user.id,
            req.user.email,
            req.user.role,
            {
              method: req.method,
              url: req.originalUrl,
              userAgent: req.get('User-Agent'),
              statusCode: res.statusCode,
              responseSize: data ? data.length : 0
            },
            (req as any).clientIp || req.ip
          );
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

export default errorHandler;
