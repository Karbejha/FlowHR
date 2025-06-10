import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Request type to include requestId and clientIp
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      clientIp?: string;
    }
  }
}

// Function to get real client IP
const getRealClientIP = (req: Request): string => {
  // Check various headers for the real IP (in order of preference)
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
  const clientIp = req.headers['x-client-ip'];
  const forwarded = req.headers['forwarded'];

  // Parse X-Forwarded-For (can be comma-separated list)
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const firstIp = ips.split(',')[0].trim();
    if (firstIp && firstIp !== '::1' && firstIp !== '127.0.0.1') {
      return firstIp;
    }
  }

  // Check other IP headers
  if (realIp && realIp !== '::1' && realIp !== '127.0.0.1') {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  if (cfConnectingIp && cfConnectingIp !== '::1' && cfConnectingIp !== '127.0.0.1') {
    return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
  }

  if (clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1') {
    return Array.isArray(clientIp) ? clientIp[0] : clientIp;
  }

  // Parse Forwarded header (RFC 7239)
  if (forwarded) {
    const forwardedHeader = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ipMatch = forwardedHeader.match(/for=([^;,]+)/);
    if (ipMatch && ipMatch[1]) {
      const ip = ipMatch[1].replace(/"/g, '').replace(/\[|\]/g, '');
      if (ip && ip !== '::1' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  }

  // Fallback to req.ip or connection.remoteAddress
  const reqIp = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
  
  // Convert IPv6 localhost to IPv4 for better readability
  if (reqIp === '::1') {
    return '127.0.0.1';
  }

  return reqIp || 'unknown';
};

// Middleware to add unique request ID and real client IP to each request
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.requestId = uuidv4();
  req.clientIp = getRealClientIP(req);
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
