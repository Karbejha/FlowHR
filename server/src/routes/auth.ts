import express from 'express';
import { register, login, logout, getProfile } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Temporarily allow first admin registration
router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);

// Protected routes
router.post('/logout', authenticate, logout as express.RequestHandler);
router.get('/profile', authenticate, getProfile as express.RequestHandler);

export default router;