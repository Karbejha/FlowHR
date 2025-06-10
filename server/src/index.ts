import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import { config } from './config/config';
import authRoutes from './routes/auth';
import leaveRoutes from './routes/leave';
import attendanceRoutes from './routes/attendance';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notifications';
import logger, { setupLogCleanup, logInfo, logError, logUserAction, testMongoDBLogging } from './utils/logger';
import { morganMiddleware, morganErrorMiddleware } from './middleware/morganLogger';
import { requestIdMiddleware, responseTimeMiddleware } from './middleware/requestTracking';
import errorHandler from './middleware/errorHandler';
import { captureAuthAttempt } from './middleware/captureAuthAttempt';
import { userActivityTracker } from './middleware/userActivityTracker';

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://flow-hr-seven.vercel.app', // Production client
    'https://flow-hr-seven.vercel.app/' // Production client with trailing slash
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request tracking middleware
app.use(requestIdMiddleware);
app.use(responseTimeMiddleware);

// Capture auth attempts middleware
app.use(captureAuthAttempt);

// HTTP request logging
app.use(morganMiddleware);
app.use(morganErrorMiddleware);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);

// Add user activity tracking for all protected routes
app.use('/api/leave', userActivityTracker, leaveRoutes);
app.use('/api/attendance', userActivityTracker, attendanceRoutes);
app.use('/api/users', userActivityTracker, userRoutes);
app.use('/api/notifications', userActivityTracker, notificationRoutes);

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(async () => {
    logInfo('Connected to MongoDB successfully');
    setupLogCleanup(mongoose.connection); // Initialize log cleanup system with connection
    
    // Test MongoDB logging after connection
    console.log('Testing MongoDB logging setup...');
    const mongoLogTest = await testMongoDBLogging();
    if (mongoLogTest.success) {
      console.log('✅ MongoDB logging test successful:', mongoLogTest.details);
      logInfo('MongoDB logging test successful', mongoLogTest.details);
    } else {
      console.error('❌ MongoDB logging test failed:', mongoLogTest.error);
      logError('MongoDB logging test failed', { error: mongoLogTest.error, details: mongoLogTest.details });
    }
  })
  .catch((err) => {
    logError('MongoDB connection error:', err);
    process.exit(1);
  });

// Health check routes
app.get('/health', (req, res) => {
  const healthData = { 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };
  logInfo('Health check requested', { requestId: req.requestId, ...healthData });
  res.json(healthData);
});

// Simple health check for load balancers/monitoring tools
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Detailed health check including database connectivity
app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: 'unknown',
      connected: false
    },
    logging: {
      mongoUri: config.mongoUri ? 'configured' : 'not configured',
      transportsActive: logger.transports.length,
      level: logger.level
    }
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.database.status = 'connected';
      health.database.connected = true;
      
      // Test logging by creating a test log entry
      logInfo('Health check with logging test', { 
        testLog: true, 
        timestamp: new Date().toISOString() 
      });
      
    } else {
      health.database.status = 'disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    health.database.status = 'error';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Diagnostic endpoint to test MongoDB logging
app.get('/test-logging', async (req, res) => {
  try {
    console.log('🔍 Starting comprehensive logging diagnostic...');
    
    // Test 1: Basic winston logging
    logInfo('Test logging endpoint called', { 
      testType: 'manual_test',
      timestamp: new Date().toISOString(),
      source: 'diagnostic_endpoint'
    });

    // Test 2: User action logging
    logUserAction(
      'Test user action from diagnostic endpoint',
      'test-user-id',
      'test@diagnostic.com',
      'admin',
      {
        testType: 'user_action_test',
        source: 'diagnostic_endpoint'
      }
    );

    // Test 3: Security event (using dynamic import to fix the earlier error)
    const { logSecurityEvent } = await import('./utils/logger');
    logSecurityEvent(
      'Test security event from diagnostic',
      'low',
      'test-user-id',
      'test@diagnostic.com',
      {
        testType: 'security_test',
        source: 'diagnostic_endpoint'
      }
    );

    // Test 4: MongoDB logging connection test
    const mongoLogTest = await testMongoDBLogging();

    // Test 5: Direct MongoDB connection test
    const db = mongoose.connection.db;
    let directMongoResult = null;
    if (db) {
      const testDoc = {
        timestamp: new Date(),
        level: 'info',
        message: 'Direct MongoDB test log via diagnostic endpoint',
        metadata: {
          testType: 'direct_mongo_test',
          source: 'diagnostic_endpoint'
        }
      };
      
      await db.collection('logs').insertOne(testDoc);
      
      // Check if logs collection exists and count documents
      const logsCount = await db.collection('logs').countDocuments();
      directMongoResult = { success: true, totalLogsInCollection: logsCount };
    } else {
      directMongoResult = { success: false, error: 'MongoDB connection not available' };
    }

    // Test 6: Check winston transports
    const transportInfo = logger.transports.map((transport: any) => ({
      name: transport.constructor.name,
      level: transport.level,
      silent: transport.silent
    }));

    const result = {
      success: true,
      message: 'Comprehensive logging tests completed',
      timestamp: new Date().toISOString(),
      tests: {
        winstonBasicLogging: 'completed',
        userActionLogging: 'completed',
        securityEventLogging: 'completed',
        mongoConnectionTest: mongoLogTest,
        directMongoTest: directMongoResult,
        transportInfo: transportInfo
      },
      mongoUri: config.mongoUri ? config.mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'not configured',
      environment: process.env.NODE_ENV || 'development'
    };

    console.log('✅ Diagnostic completed:', JSON.stringify(result, null, 2));
    res.json(result);
    
  } catch (error) {
    console.error('❌ Diagnostic endpoint error:', error);
    logError('Test logging endpoint error', { error: error instanceof Error ? error.message : error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(config.port, () => {
  logInfo(`Server started successfully on port ${config.port}`, {
    port: config.port,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});