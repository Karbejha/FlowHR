import { Request, Response, NextFunction } from 'express';
import { logUserAction } from '../utils/logger';

// Middleware to track all user activities
export const userActivityTracker = (req: Request, res: Response, next: NextFunction) => {
  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override res.send to log successful operations
  res.send = function(data) {
    logActivity();
    return originalSend.call(this, data);
  };
  
  // Override res.json to log successful operations
  res.json = function(data) {
    logActivity();
    return originalJson.call(this, data);
  };
  
  const logActivity = () => {
    // Only log for authenticated users and successful operations
    if (req.user && res.statusCode < 400) {
      const action = getActionDescription(req.method, req.originalUrl);
      
      logUserAction(
        `User activity: ${action}`,
        req.user.id,
        req.user.email,
        req.user.role,
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
          params: req.params,
          query: req.query,
          // Don't log sensitive data like passwords
          body: sanitizeBody(req.body)
        }
      );
    }
  };
  
  next();
};

// Function to get human-readable action description
const getActionDescription = (method: string, url: string): string => {
  const cleanUrl = url.split('?')[0]; // Remove query parameters
  
  const actionMap: Record<string, string> = {
    'GET /api/users/employees': 'Viewed employee list',
    'GET /api/users/profile': 'Accessed profile',
    'POST /api/users/create': 'Created new user',
    'PUT /api/users/update': 'Updated user information',
    'DELETE /api/users': 'Deleted user',
    
    'GET /api/leave/all': 'Viewed leave requests',
    'POST /api/leave/request': 'Submitted leave request',
    'PUT /api/leave/approve': 'Approved leave request',
    'PUT /api/leave/reject': 'Rejected leave request',
    'GET /api/leave/balance': 'Checked leave balance',
    
    'GET /api/attendance/team': 'Viewed team attendance',
    'POST /api/attendance/clock-in': 'Clocked in',
    'POST /api/attendance/clock-out': 'Clocked out',
    'GET /api/attendance/my': 'Viewed personal attendance',
    
    'GET /api/notifications': 'Viewed notifications',
    'PUT /api/notifications/read': 'Marked notification as read',
    
    'POST /api/auth/logout': 'Logged out',
    'GET /api/auth/profile': 'Accessed profile',
    
    'GET /health': 'Health check',
    'GET /health/detailed': 'Detailed health check'
  };
  
  // Create a key from method and clean URL
  const key = `${method} ${cleanUrl}`;
  
  // Try exact match first
  if (actionMap[key]) {
    return actionMap[key];
  }
  
  // Try pattern matching for dynamic routes
  for (const [pattern, description] of Object.entries(actionMap)) {
    if (matchesPattern(key, pattern)) {
      return description;
    }
  }
  
  // Default description
  return `${method} ${cleanUrl}`;
};

// Function to match URL patterns with dynamic segments
const matchesPattern = (url: string, pattern: string): boolean => {
  // Convert pattern to regex (e.g., "GET /api/users/update" matches "GET /api/users/update/123")
  const regexPattern = pattern
    .replace(/\[.*?\]/g, '[^/]+') // Replace [id] with regex for any non-slash characters
    .replace(/:\w+/g, '[^/]+');   // Replace :id with regex for any non-slash characters
    
  const regex = new RegExp(`^${regexPattern}(/.*)?$`);
  return regex.test(url);
};

// Function to sanitize request body (remove sensitive information)
const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};
