import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { config } from '../config/config';
import { Types } from 'mongoose';
import { logError, logUserAction, logUserError, logSecurityEvent } from '../utils/logger';
import { sanitizeUserData, sanitizeUserDataAuth, SanitizedUser } from '../utils/userUtils';

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
    });    await user.save();    // Log successful registration
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
        ip: (req as any).clientIp || req.ip,
        userAgent: req.get('User-Agent')
      },
      (req as any).clientIp || req.ip
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

    // Return minimal user data for security (only essential info for registration)
    const sanitizedUser = sanitizeUserDataAuth(user);

    res.status(201).json({ user: sanitizedUser, token });
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
    
    if (!user || !user.isActive) {      // Log failed login attempt
      logSecurityEvent(
        'Failed login attempt - user not found or inactive',
        'medium',
        undefined,
        email,
        {
          ip: (req as any).clientIp || req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        },
        (req as any).clientIp || req.ip
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {      // Log failed login attempt
      logSecurityEvent(
        'Failed login attempt - incorrect password',
        'medium',
        (user._id as Types.ObjectId).toString(),
        user.email,
        {
          ip: (req as any).clientIp || req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        },
        (req as any).clientIp || req.ip
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }    // Log successful login
    logUserAction(
      'User logged in successfully',
      (user._id as Types.ObjectId).toString(),
      user.email,
      user.role,
      {
        ip: (req as any).clientIp || req.ip,
        userAgent: req.get('User-Agent'),
        loginTime: new Date().toISOString()
      },
      (req as any).clientIp || req.ip
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

    // Return minimal user data for security (only essential info for login)
    const sanitizedUser = sanitizeUserDataAuth(user);

    res.json({ user: sanitizedUser, token });  } catch (error) {    // Enhanced error logging for login failures
    logUserError(
      'Login attempt failed with error',
      error as Error,
      undefined,
      req.body.email,
      'unknown',
      {
        ip: (req as any).clientIp || req.ip,
        userAgent: req.get('User-Agent'),
        attemptedEmail: req.body.email,
        errorType: 'login_error',
        timestamp: new Date().toISOString()
      },
      (req as any).clientIp || req.ip
    );
    res.status(400).json({ error: 'Error logging in' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (user) {      // Log user logout
      logUserAction(
        'User logged out successfully',
        user.id,
        user.email,
        user.role,
        {
          ip: (req as any).clientIp || req.ip,
          userAgent: req.get('User-Agent'),
          logoutTime: new Date().toISOString(),
          sessionDuration: 'calculated_if_available'
        },
        (req as any).clientIp || req.ip
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

// Get current user profile - returns full profile data
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (user) {      // Log profile access
      logUserAction(
        'User accessed profile',
        user.id,
        user.email,
        user.role,
        {
          ip: (req as any).clientIp || req.ip,
          userAgent: req.get('User-Agent'),
          accessTime: new Date().toISOString()
        },
        (req as any).clientIp || req.ip
      );
    }

    // Return full user data for profile management
    const sanitizedUser = sanitizeUserData(user);

    res.json({ user: sanitizedUser });
  } catch (error) {    logUserError(
      'Profile access error',
      error as Error,
      req.user?.id,
      req.user?.email,
      req.user?.role,
      {
        ip: (req as any).clientIp || req.ip,
        userAgent: req.get('User-Agent')
      },
      (req as any).clientIp || req.ip
    );
    res.status(400).json({ error: 'Error fetching profile' });
  }
};

// Get current user basic info - returns minimal data for UI
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Return minimal user data for UI components
    const sanitizedUser = sanitizeUserDataAuth(user);

    res.json({ user: sanitizedUser });
  } catch (error) {
    logUserError(
      'Current user access error',
      error as Error,
      req.user?.id,
      req.user?.email,
      req.user?.role,
      {
        ip: (req as any).clientIp || req.ip,
        userAgent: req.get('User-Agent')
      },
      (req as any).clientIp || req.ip
    );
    res.status(400).json({ error: 'Error fetching current user' });
  }
};

// Function to change password with current password verification
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      // Log security event for failed password change attempt
      logSecurityEvent(
        'Failed password change attempt - incorrect current password',
        'medium',
        (user._id as Types.ObjectId).toString(),
        user.email,
        {
          ip: (req as any).clientIp || req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        },
        (req as any).clientIp || req.ip
      );
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Log successful password change
    logUserAction(
      'Password changed successfully',
      (user._id as Types.ObjectId).toString(),
      user.email,
      user.role,
      {
        ip: (req as any).clientIp || req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      },
      (req as any).clientIp || req.ip
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logUserError(
      'Password change error',
      error as Error,
      req.user?._id,
      req.user?.email,
      req.user?.role,
      {
        ip: (req as any).clientIp || req.ip,
        userAgent: req.get('User-Agent')
      },
      (req as any).clientIp || req.ip
    );
    res.status(500).json({ error: 'Error changing password' });
  }
};