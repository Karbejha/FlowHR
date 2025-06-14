import morgan, { StreamOptions } from 'morgan';
import logger from '../utils/logger';
import { Request, Response } from 'express';

// Custom stream for morgan to use our winston logger
const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging in test environment
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: Request, res: Response) => {
  // Try to get from our custom property first, then fallback to default
  const customTime = (req as any).responseTime;
  if (customTime) {
    return `${customTime.toFixed(3)} ms`;
  }
  return '-';
});

// Custom token for user ID if authenticated
morgan.token('user-id', (req: Request) => {
  return (req as any).user?.id || 'anonymous';
});

// Custom token for user email
morgan.token('user-email', (req: Request) => {
  return (req as any).user?.email || (req as any).attemptedEmail || 'unknown';
});

// Custom token for user role
morgan.token('user-role', (req: Request) => {
  return (req as any).user?.role || 'unknown';
});

// Custom token for request body email (for failed auth attempts)
morgan.token('request-email', (req: Request) => {
  if (req.body && (req.body as any).email && req.originalUrl.includes('/auth/')) {
    return (req.body as any).email;
  }
  return (req as any).user?.email || 'unknown';
});

// Custom token for request ID (you can add this via middleware)
morgan.token('request-id', (req: Request) => {
  return (req as any).requestId || '-';
});

// Custom token for real client IP
morgan.token('real-ip', (req: Request) => {
  return (req as any).clientIp || req.ip || (req.connection as any)?.remoteAddress || 'unknown';
});

// Custom token for GMT+3 timestamp
morgan.token('date-gmt3', () => {
  const now = new Date();
  // Convert to GMT+3
  const gmt3Time = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  return gmt3Time.toISOString().replace('T', ' ').substring(0, 19) + ' GMT+3';
});

// Define different formats for different environments

// Production format - minimal but essential info with real IP and GMT+3 time
const productionFormat = ':real-ip :user-email [:date-gmt3] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Development format - more detailed with user info and real IP
const developmentFormat = ':method :url :status :response-time ms - :res[content-length] - :user-email (:user-role) [:user-id] - IP: :real-ip';

// Combined format with custom fields and real IP
const combinedFormat = ':real-ip - :user-email (:user-role) [:date-gmt3] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Create morgan middleware based on environment
const morganMiddleware = morgan(
  process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  {
    stream: {
      write: (message: string) => {
        // Extract user info from the log message for better structure
        const userEmailMatch = message.match(/(\S+@\S+\.\S+)/);
        const userRoleMatch = message.match(/\((\w+)\)/);
        const userIdMatch = message.match(/\[([^\]]+)\]$/);
        
        logger.http(message.trim(), {
          logType: 'http_request',
          extractedUser: {
            email: userEmailMatch ? userEmailMatch[1] : 'unknown',
            role: userRoleMatch ? userRoleMatch[1] : 'unknown',
            id: userIdMatch ? userIdMatch[1] : 'unknown'
          }
        });
      },
    },
    skip,
  }
);

// Special morgan for error logging
const morganErrorMiddleware = morgan(
  ':real-ip :request-email (:user-role) [:date-gmt3] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    stream: {
      write: (message: string) => {
        // Extract email from the log message for better tracking
        const emailMatch = message.match(/(\S+@\S+\.\S+)/);
        const email = emailMatch ? emailMatch[1] : 'unknown';
        
        logger.error(`HTTP Error: ${message.trim()}`, {
          extractedEmail: email,
          logType: 'http_error',
          severity: message.includes(' 5') ? 'high' : 'medium'
        });
      },
    },
    skip: (req: Request, res: Response) => res.statusCode < 400,
  }
);

export { morganMiddleware, morganErrorMiddleware };
export default morganMiddleware;
