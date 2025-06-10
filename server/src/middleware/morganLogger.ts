import morgan, { StreamOptions } from 'morgan';
import logger from '../utils/logger';

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
morgan.token('response-time-ms', (req: any, res) => {
  // Try to get from our custom property first, then fallback to default
  const customTime = req.responseTime;
  if (customTime) {
    return `${customTime.toFixed(3)} ms`;
  }
  return '-';
});

// Custom token for user ID if authenticated
morgan.token('user-id', (req: any) => {
  return req.user?.id || 'anonymous';
});

// Custom token for user email
morgan.token('user-email', (req: any) => {
  return req.user?.email || req.attemptedEmail || 'unknown';
});

// Custom token for user role
morgan.token('user-role', (req: any) => {
  return req.user?.role || 'unknown';
});

// Custom token for request body email (for failed auth attempts)
morgan.token('request-email', (req: any) => {
  if (req.body && req.body.email && req.originalUrl.includes('/auth/')) {
    return req.body.email;
  }
  return req.user?.email || 'unknown';
});

// Custom token for request ID (you can add this via middleware)
morgan.token('request-id', (req: any) => {
  return req.requestId || '-';
});

// Define different formats for different environments

// Production format - minimal but essential info
const productionFormat = ':remote-addr :user-email [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Development format - more detailed with user info
const developmentFormat = ':method :url :status :response-time ms - :res[content-length] - :user-email (:user-role) [:user-id]';

// Combined format with custom fields
const combinedFormat = ':remote-addr - :user-email (:user-role) [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

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
  ':remote-addr :request-email (:user-role) [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
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
    skip: (req, res) => res.statusCode < 400,
  }
);

export { morganMiddleware, morganErrorMiddleware };
export default morganMiddleware;
