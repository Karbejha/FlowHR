import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { config } from '../config/config';
import { Types } from 'mongoose';

// Define interface for JWT payload
interface JWTPayload {
  userId: string;
  role: UserRole;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, department, jobTitle, managerId } = req.body;

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
      role,
      department,
      jobTitle,
      managerId
    });

    await user.save();

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
    res.status(400).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Error logging in' });
  }
};