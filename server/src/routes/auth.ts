import express from 'express';
import { register, login } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Temporarily allow first admin registration
router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);

export default router;