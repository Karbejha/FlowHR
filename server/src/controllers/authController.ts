import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { config } from '../config/config';
import { Types } from 'mongoose';
import { logError, logUserAction, logUserError, logSecurityEvent } from '../utils/logger';

// Define interface for JWT payload
interface JWTPayload {
  userId: string;
  role: UserRole;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, department, jobTitle, managerId } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !department || !jobTitle) {
      return res.status(400).json({ error: 'Required fields: email, password, firstName, lastName, department, jobTitle' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.EMPLOYEE,
      department,
      jobTitle,
      managerId
    });    await user.save();

    // Log successful registration
    logUserAction(
      'User registered successfully',
      (user._id as Types.ObjectId).toString(),
      user.email,
      user.role,
      {
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        jobTitle: user.jobTitle,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    // Generate JWT token
    const payload: JWTPayload = {
      userId: (user._id as Types.ObjectId).toString(),
      role: user.role
    };

    const token = jwt.sign(
      payload,
      config.jwtSecret || 'fallback-secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    logError('Registration error', {
      email: req.body.email,
      role: req.body.role,
      error: error instanceof Error ? error.message : error
    });
    res.status(400).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user || !user.isActive) {
      // Log failed login attempt
      logSecurityEvent(
        'Failed login attempt - user not found or inactive',
        'medium',
        undefined,
        email,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        }
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      // Log failed login attempt
      logSecurityEvent(
        'Failed login attempt - incorrect password',
        'medium',
        (user._id as Types.ObjectId).toString(),
        user.email,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        }
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log successful login
    logUserAction(
      'User logged in successfully',
      (user._id as Types.ObjectId).toString(),
      user.email,
      user.role,
      {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        loginTime: new Date().toISOString()
      }
    );

    // Generate JWT token
    const payload: JWTPayload = {
      userId: (user._id as Types.ObjectId).toString(),
      role: user.role
    };

    const token = jwt.sign(
      payload,
      config.jwtSecret || 'fallback-secret',
      { expiresIn: '1d' }
    );

    res.json({ user, token });  } catch (error) {
    // Enhanced error logging for login failures
    logUserError(
      'Login attempt failed with error',
      error as Error,
      undefined,
      req.body.email,
      'unknown',
      {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        attemptedEmail: req.body.email,
        errorType: 'login_error',
        timestamp: new Date().toISOString()
      }
    );
    res.status(400).json({ error: 'Error logging in' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (user) {
      // Log user logout
      logUserAction(
        'User logged out successfully',
        user.id,
        user.email,
        user.role,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          logoutTime: new Date().toISOString(),
          sessionDuration: 'calculated_if_available'
        }
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logError('Logout error', {
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id
    });
    res.status(400).json({ error: 'Error logging out' });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (user) {
      // Log profile access
      logUserAction(
        'User accessed profile',
        user.id,
        user.email,
        user.role,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          accessTime: new Date().toISOString()
        }
      );
    }

    res.json({ user });
  } catch (error) {
    logUserError(
      'Profile access error',
      error as Error,
      req.user?.id,
      req.user?.email,
      req.user?.role,
      {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );
    res.status(400).json({ error: 'Error fetching profile' });
  }
};