import { Request, Response } from 'express';
import { User } from '../models/User';
import { logError } from '../utils/logger';

export const getUsersByBirthMonth = async (req: Request, res: Response): Promise<void> => {
  try {
    const month = parseInt(req.params.month, 10);
    
    if (isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Invalid month parameter' });
      return;
    }

    // Create a MongoDB aggregation to find users with birthdays in the specified month
    const users = await User.aggregate([
      {
        $addFields: {
          birthMonth: { $month: '$dateOfBirth' }
        }
      },
      {
        $match: {
          birthMonth: month,
          isActive: true
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          dateOfBirth: 1,
          avatar: 1,
          department: 1,
          jobTitle: 1,
          role: 1
        }
      },
      {
        $sort: {
          // Sort by day of month
          dateOfBirth: 1
        }
      }
    ]);

    res.json(users);
  } catch (error) {
    logError('Error fetching users by birth month', {
      month: req.params.month,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ error: 'Error fetching users by birth month' });
  }
};
