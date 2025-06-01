import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, UserRole } from '../models/User';

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    let query = {};
    
    // If manager, only show their team members
    if (req.user.role === UserRole.MANAGER) {
      query = { managerId: req.user._id };
    }

    const employees = await User.find(query)
      .select('-password')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(employees);
  } catch (error) {
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
    const { email, password, firstName, lastName, role, department, jobTitle, managerId } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role || !department || !jobTitle) {
      res.status(400).json({ error: 'Required fields: email, password, firstName, lastName, role, department, jobTitle' });
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
      managerId: effectiveManagerId
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
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
    const { email, firstName, lastName, role, department, jobTitle, managerId } = req.body;

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
    }

    // Update user
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
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
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

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};
