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
import logger, { setupLogCleanup, logInfo, logError } from './utils/logger';
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
  .then(() => {
    logInfo('Connected to MongoDB successfully');
    setupLogCleanup(mongoose.connection); // Initialize log cleanup system with connection
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
    }
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.database.status = 'connected';
      health.database.connected = true;
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

// Start server
app.listen(config.port, () => {
  logInfo(`Server started successfully on port ${config.port}`, {
    port: config.port,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});