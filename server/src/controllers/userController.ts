import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { User, UserRole } from '../models/User';
import { uploadToS3, deleteFromS3, getS3KeyFromUrl } from '../utils/s3Service';
import { logError, logWarn } from '../utils/logger';

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    let query: any = {};
    
    // If manager, only show their team members
    if (req.user.role === UserRole.MANAGER) {
      query = { managerId: req.user._id };
    }
    
    // Handle search parameter
    if (req.query.search) {
      const searchTerm = req.query.search as string;
      // Search across multiple fields
      const searchRegex = new RegExp(searchTerm, 'i');
      query = {
        ...query,
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { jobTitle: searchRegex }
        ]
      };
    }
    
    // Handle department filter
    if (req.query.department) {
      query.department = req.query.department;
    }
    
    // Handle role filter
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Handle active status filter
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Count total employees for pagination
    const totalEmployees = await User.countDocuments(query);
    
    // Get paginated results
    const employees = await User.find(query)
      .select('-password')
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      employees,
      pagination: {
        total: totalEmployees,
        page,
        limit,
        totalPages: Math.ceil(totalEmployees / limit)
      }
    });
  } catch (error) {
    logError('Error fetching employees', { error });
    res.status(500).json({ error: 'Error fetching employees' });
  }
};

export const updateEmployeeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Prevent deactivating admins
    if (user.role === UserRole.ADMIN) {
      res.status(403).json({ error: 'Cannot modify admin status' });
      return;
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: 'Employee status updated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error updating employee status' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, department, jobTitle, managerId, dateOfBirth } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role || !department || !jobTitle || !dateOfBirth) {
      res.status(400).json({ error: 'Required fields: email, password, firstName, lastName, role, department, jobTitle, dateOfBirth' });
      return;
    }

    // Validate that managers can only create employees
    if (req.user.role === UserRole.MANAGER && role !== UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Managers can only create employee accounts' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }    // Validate managerId requirement for employees
    let effectiveManagerId = null;
    if (role === UserRole.EMPLOYEE) {
      if (req.user.role === UserRole.MANAGER) {
        // If manager is creating user, set managerId to themselves
        effectiveManagerId = req.user._id;
      } else if (managerId && managerId.trim() !== '') {
        // Admin can specify managerId, but only if it's not empty
        effectiveManagerId = managerId;
      } else {
        res.status(400).json({ error: 'Manager ID is required for employee accounts' });
        return;
      }
    }    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      department,
      jobTitle,
      managerId: effectiveManagerId,
      dateOfBirth: new Date(dateOfBirth)
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;    res.status(201).json(userWithoutPassword);
  } catch (error) {
    logError('Error creating user', {
      email: req.body.email,
      role: req.body.role,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, email } = req.body;

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
};

export const getManagers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only admins can see all managers, managers can only see themselves
    let query = {};
    
    if (req.user.role === UserRole.ADMIN) {
      query = { 
        role: { $in: [UserRole.ADMIN, UserRole.MANAGER] },
        isActive: true 
      };
    } else {
      // Non-admins can only see themselves if they're a manager
      query = { 
        _id: req.user._id,
        role: { $in: [UserRole.ADMIN, UserRole.MANAGER] },
        isActive: true 
      };
    }

    const managers = await User.find(query)
      .select('firstName lastName email')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching managers' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, department, jobTitle, managerId, dateOfBirth } = req.body;

    // Only admins can update other users
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent modifying admin accounts (except by other admins)
    if (user.role === UserRole.ADMIN && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Cannot modify admin accounts' });
      return;
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    // Validate managerId if provided and role is employee
    if (role === UserRole.EMPLOYEE && managerId) {
      if (!managerId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ error: 'Invalid manager ID format' });
        return;
      }

      const manager = await User.findById(managerId);
      if (!manager || (manager.role !== UserRole.MANAGER && manager.role !== UserRole.ADMIN)) {
        res.status(400).json({ error: 'Invalid manager selected' });
        return;
      }
    }    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        role: role || user.role,
        department: department || user.department,
        jobTitle: jobTitle || user.jobTitle,
        managerId: role === UserRole.EMPLOYEE ? managerId : undefined,
        dateOfBirth: dateOfBirth || user.dateOfBirth,
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }    res.json(updatedUser);
  } catch (error) {
    logError('Error updating user', {
      userId: req.params.id,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ error: 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Only admins can delete users
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }    // Prevent deleting admin accounts
    if (user.role === UserRole.ADMIN) {
      res.status(403).json({ error: 'Cannot delete admin accounts' });
      return;
    }    // Prevent self-deletion
    if ((user._id as mongoose.Types.ObjectId).toString() === req.user._id.toString()) {
      res.status(403).json({ error: 'Cannot delete your own account' });
      return;
    }

    await User.findByIdAndDelete(id);    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logError('Error deleting user', {
      userId: req.params.id,
      adminId: req.user._id,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ error: 'Error deleting user' });
  }
};

export const adminChangePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { password: newPassword } = req.body;

    // Only admins and managers can change other users' passwords
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MANAGER) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent changing admin passwords unless you're an admin
    if (user.role === UserRole.ADMIN && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Cannot change admin passwords' });
      return;
    }

    // If manager, ensure they can only change passwords of their team members
    if (req.user.role === UserRole.MANAGER) {
      if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
        res.status(403).json({ error: 'Managers cannot change admin or manager passwords' });
        return;
      }
      
      // Check if the user is under this manager's supervision
      if (user.managerId?.toString() !== req.user._id.toString()) {
        res.status(403).json({ error: 'You can only change passwords of your team members' });
        return;
      }
    }

    // Update password (will be hashed by the pre-save middleware)
    user.password = newPassword;
    await user.save();    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logError('Error changing password', {
      userId: req.params.id,
      adminId: req.user._id,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ error: 'Error changing password' });
  }
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Get target user ID from URL params or use current user
    const targetUserId = req.params.id || req.user._id;
    const user = await User.findById(targetUserId);
    
    if (!user) {
      // Clean up temporary file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // If uploading for another user, check permissions
    if (targetUserId.toString() !== req.user._id.toString()) {
      if (req.user.role === UserRole.EMPLOYEE) {
        // Clean up temporary file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(403).json({ error: 'Employees cannot upload avatars for other users' });
        return;
      }
      
      if (req.user.role === UserRole.MANAGER) {
        // Managers can only upload avatars for their team members
        if (user.managerId?.toString() !== req.user._id.toString() && user.role !== UserRole.EMPLOYEE) {
          // Clean up temporary file
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          res.status(403).json({ error: 'You can only upload avatars for your team members' });
          return;
        }
      }
    }

    try {
      // Delete old avatar from S3 if it exists
      if (user.avatar) {
        try {
          const oldS3Key = getS3KeyFromUrl(user.avatar);          await deleteFromS3(oldS3Key);
        } catch (deleteError) {
          logWarn('Failed to delete old avatar from S3', {
            userId: user._id,
            oldS3Key: getS3KeyFromUrl(user.avatar),
            error: deleteError instanceof Error ? deleteError.message : deleteError
          });
          // Continue with upload even if deletion fails
        }
      }

      // Upload new avatar to S3
      const s3Key = `avatars/${req.file.filename}`;
      const contentType = req.file.mimetype || 'image/jpeg';
      
      const s3Result = await uploadToS3(req.file.path, s3Key, contentType);

      // Update user with new avatar S3 URL
      user.avatar = s3Result.Location;
      await user.save();

      res.json({ 
        message: 'Avatar uploaded successfully',
        avatar: s3Result.Location      });
    } catch (s3Error) {
      logError('S3 upload error', {
        userId: user._id,
        filename: req.file.filename,
        error: s3Error instanceof Error ? s3Error.message : s3Error
      });
      
      // Clean up temporary file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ error: 'Failed to upload avatar to cloud storage' });    }
  } catch (error) {
    logError('Error uploading avatar', {
      userId: req.params.id,
      filename: req.file?.filename,
      error: error instanceof Error ? error.message : error
    });
    
    // Clean up temporary file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Error uploading avatar' });
  }
};

export const deleteAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get target user ID from URL params or use current user
    const targetUserId = req.params.id || req.user._id;
    const user = await User.findById(targetUserId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // If deleting for another user, check permissions
    if (targetUserId.toString() !== req.user._id.toString()) {
      if (req.user.role === UserRole.EMPLOYEE) {
        res.status(403).json({ error: 'Employees cannot delete avatars for other users' });
        return;
      }
      
      if (req.user.role === UserRole.MANAGER) {
        // Managers can only delete avatars for their team members
        if (user.managerId?.toString() !== req.user._id.toString() && user.role !== UserRole.EMPLOYEE) {
          res.status(403).json({ error: 'You can only delete avatars for your team members' });
          return;
        }
      }
    }

    // Delete avatar from S3 if it exists
    if (user.avatar) {
      try {
        const s3Key = getS3KeyFromUrl(user.avatar);        await deleteFromS3(s3Key);
      } catch (deleteError) {
        logWarn('Failed to delete avatar from S3', {
          userId: user._id,
          s3Key: getS3KeyFromUrl(user.avatar),
          error: deleteError instanceof Error ? deleteError.message : deleteError
        });
        // Continue with database update even if S3 deletion fails
      }
    }

    // Remove avatar from user
    user.avatar = undefined;
    await user.save();    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    logError('Error deleting avatar', {
      userId: req.params.id,
      error: error instanceof Error ? error.message : error    });
    res.status(500).json({ error: 'Error deleting avatar' });
  }
};

export const getUsersByBirthMonth = async (req: Request, res: Response): Promise<void> => {
  try {
    const month = parseInt(req.params.month, 10);
    
    if (isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Invalid month parameter' });
      return;
    }

    console.log(`Finding users with birthdays in month: ${month}`);

    // Debug: Log all users with their birth months
    const allUsers = await User.find({}).select('firstName lastName dateOfBirth');
    console.log('All users:', allUsers.map(u => ({
      name: `${u.firstName} ${u.lastName}`,
      dateOfBirth: u.dateOfBirth,
      month: u.dateOfBirth ? new Date(u.dateOfBirth).getMonth() + 1 : 'no date'
    })));

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

    console.log(`Found ${users.length} users with birthdays in month ${month}`);
    res.json(users);
  } catch (error) {
    console.error('Error in getUsersByBirthMonth:', error);
    logError('Error fetching users by birth month', {
      month: req.params.month,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ error: 'Error fetching users by birth month' });
  }
};
