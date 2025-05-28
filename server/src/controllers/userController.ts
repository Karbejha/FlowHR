import { Request, Response } from 'express';
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
    }

    // If manager is creating user, set managerId to themselves
    const effectiveManagerId = req.user.role === UserRole.MANAGER ? req.user._id : managerId;

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

    await user.save();    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
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
