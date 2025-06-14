import winston from 'winston';
import 'winston-mongodb';
import { config } from '../config/config';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(logColors);

// Custom timestamp function for GMT+3
const getGMT3Timestamp = () => {
  const now = new Date();
  // Convert to GMT+3
  const gmt3Time = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  return gmt3Time.toISOString().replace('T', ' ').substring(0, 23) + ' GMT+3';
};

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: getGMT3Timestamp }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  }),
);

// Custom format for MongoDB storage (structured JSON) with GMT+3
const mongoFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({ fillExcept: ['message', 'level'] })
);

// Define which transports the logger must use
const transports: winston.transport[] = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: consoleFormat,
  }),    // File transport for errors - with proper error handling
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp({ format: getGMT3Timestamp }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: false,
    handleRejections: false,
  }),
  
  // File transport for all logs - with proper error handling
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp({ format: getGMT3Timestamp }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: false,
    handleRejections: false,
  }),
];

// Add MongoDB transport if MongoDB is configured
if (config.mongoUri) {
  try {
    console.log('Attempting to initialize MongoDB transport with URI:', config.mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      const mongoTransport = new winston.transports.MongoDB({
      db: config.mongoUri,
      collection: 'logs',
      format: mongoFormat,
      // Store logs for only 7 days or latest 10000 logs
      capped: true,
      cappedSize: 10000000, // 10MB cap
      cappedMax: 10000, // Maximum 10000 documents
      expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days in seconds
      level: 'debug', // Always log everything to MongoDB, regardless of environment
      options: {
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      },
      // Override timestamp to use GMT+3
      timestamp: () => getGMT3Timestamp()
    } as any);

    // Add error event handlers for the MongoDB transport
    mongoTransport.on('error', (error) => {
      console.error('MongoDB transport error:', error);
    });

    mongoTransport.on('open', () => {
      console.log('MongoDB transport connection opened successfully');
    });

    mongoTransport.on('close', () => {
      console.log('MongoDB transport connection closed');
    });

    transports.push(mongoTransport);
    console.log('MongoDB transport initialized for logging');
  } catch (error) {
    console.error('Failed to initialize MongoDB transport:', error);
  }
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: getGMT3Timestamp }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: transports,
  exitOnError: false,
});

// Log configuration details for debugging
console.log('Logger Configuration:', {
  environment: process.env.NODE_ENV,
  mongoUri: config.mongoUri ? 'configured' : 'not configured',
  transportsCount: transports.length,
  logLevel: logger.level
});

// Handle uncaught exceptions and rejections safely
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Try to log to winston if available, but don't crash if it fails
  try {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  } catch (logError) {
    console.error('Failed to log uncaught exception:', logError);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Try to log to winston if available, but don't crash if it fails
  try {
    logger.error('Unhandled Rejection', { reason, promise: promise.toString() });
  } catch (logError) {
    console.error('Failed to log unhandled rejection:', logError);  }
});

// Add error handlers to prevent uncaught errors from file transports
logger.transports.forEach((transport) => {
  if (transport instanceof winston.transports.File) {
    transport.on('error', (error) => {
      console.error('Winston file transport error:', error);
    });
  }
});

// Enhanced logging functions with user context
export const logUserAction = (
  message: string, 
  userId?: string, 
  userEmail?: string, 
  userRole?: string,
  additionalMeta: any = {},
  clientIp?: string
) => {
  const logData = {
    ...additionalMeta,
    user: {
      id: userId || 'anonymous',
      email: userEmail || 'unknown',
      role: userRole || 'unknown',
      clientIp: clientIp || 'unknown'
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  // Always log user actions as 'info' level to ensure they appear in production
  logger.info(message, logData);
  
  // Also log to console in production for immediate visibility
  if (process.env.NODE_ENV === 'production') {
    console.log(`[${getGMT3Timestamp()}] USER_ACTION: ${message}`, {
      user: `${userEmail} (${userId})`,
      ip: clientIp
    });
  }
};

export const logUserError = (
  message: string, 
  error: Error, 
  userId?: string, 
  userEmail?: string, 
  userRole?: string,
  additionalMeta: any = {},
  clientIp?: string
) => {
  logger.error(message, {
    ...additionalMeta,
    user: {
      id: userId || 'anonymous',
      email: userEmail || 'unknown',
      role: userRole || 'unknown',
      clientIp: clientIp || 'unknown'
    },
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    environment: process.env.NODE_ENV || 'development'
  });
};

export const logSecurityEvent = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  userId?: string,
  userEmail?: string,
  additionalMeta: any = {},
  clientIp?: string
) => {
  logger.warn(`SECURITY: ${event}`, {
    ...additionalMeta,
    security: {
      event,
      severity,
      clientIp: clientIp || 'unknown'
    },
    user: {
      id: userId || 'anonymous',
      email: userEmail || 'unknown'
    },
    environment: process.env.NODE_ENV || 'development'
  });
};

// Log cleanup function to ensure 7-day retention and 10k log limit
export const setupLogCleanup = async (mongooseConnection: any) => {
  if (!config.mongoUri) return;

  try {
    const db = mongooseConnection.db;
    
    if (!db) {
      throw new Error('Database connection not available');
    }    // Create TTL index for automatic cleanup after 7 days
    try {
      await db.collection('logs').createIndex(
        { timestamp: 1 }, 
        { 
          expireAfterSeconds: 7 * 24 * 60 * 60,
          name: 'timestamp_ttl_index' 
        }
      );
    } catch (indexError: any) {
      // Index might already exist, that's okay
      if (indexError.code !== 86) { // 86 is IndexKeySpecsConflict
        throw indexError;
      }
      logInfo('Log TTL index already exists, skipping creation');
    }

    // Function to clean old logs if count exceeds 10000
    const cleanOldLogs = async () => {
      try {
        const count = await db.collection('logs').countDocuments();
        if (count > 10000) {
          const excess = count - 10000;
          const oldLogs = await db.collection('logs')
            .find({})
            .sort({ timestamp: 1 })
            .limit(excess)
            .toArray();
            if (oldLogs.length > 0) {
            const idsToDelete = oldLogs.map((log: any) => log._id);
            await db.collection('logs').deleteMany({ _id: { $in: idsToDelete } });
            logger.info(`Cleaned up ${excess} old logs to maintain 10k limit`);
          }
        }
      } catch (error) {
        logger.error('Error cleaning old logs:', error);
      }
    };

    // Run cleanup every hour
    setInterval(cleanOldLogs, 60 * 60 * 1000); // 1 hour
    
    // Run cleanup on startup
    cleanOldLogs();

    logger.info('Log cleanup system initialized');
  } catch (error) {
    logger.error('Failed to setup log cleanup:', error);
  }
};

// Utility functions for different log levels
export const logError = (message: string, meta?: any) => {
  logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Graceful shutdown handler for Winston
export const shutdownLogger = () => {
  return new Promise<void>((resolve) => {
    logger.end(() => {
      resolve();
    });
  });
};

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  try {
    await shutdownLogger();
    console.log('Logger shutdown complete');
  } catch (error) {
    console.error('Error shutting down logger:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  try {
    await shutdownLogger();
    console.log('Logger shutdown complete');
  } catch (error) {
    console.error('Error shutting down logger:', error);
  }
  process.exit(0);
});

// Export the logger instance
export default logger;

// Test MongoDB logging connection
export const testMongoDBLogging = async (): Promise<{ success: boolean; error?: string; details?: any }> => {
  if (!config.mongoUri) {
    return { success: false, error: 'MongoDB URI not configured' };
  }

  try {
    // Test direct MongoDB connection
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db();
    
    // Test writing to logs collection
    const testDoc = {
      timestamp: new Date(),
      level: 'info',
      message: 'MongoDB logging test from winston setup',
      metadata: {
        testType: 'direct_connection_test',
        source: 'logger_initialization'
      }
    };
    
    const result = await db.collection('logs').insertOne(testDoc);
    await client.close();

    return {
      success: true,
      details: {
        insertedId: result.insertedId,
        mongoUri: config.mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
        database: db.databaseName
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        mongoUri: config.mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
      }
    };
  }
};
