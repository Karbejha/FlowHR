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

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Health check routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
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
  console.log(`Server is running on port ${config.port}`);
});