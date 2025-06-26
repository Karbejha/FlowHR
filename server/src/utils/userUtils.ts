import { User, UserRole } from '../models/User';

// Define interface for sanitized user data
export interface SanitizedUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  isActive: boolean;
  hireDate: Date;
  avatar?: string;
  dateOfBirth: Date;
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
    unpaid?: number;
    maternity?: number;
    paternity?: number;
    other?: number;
  };
  settings?: any; // Include settings if needed for frontend
  createdAt?: Date;
  updatedAt?: Date;
}

// Function to sanitize user data for authentication/profile responses
export const sanitizeUserData = (user: any): SanitizedUser => {
  const sanitized: SanitizedUser = {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    department: user.department,
    jobTitle: user.jobTitle,
    isActive: user.isActive,
    hireDate: user.hireDate,
    avatar: user.avatar,
    dateOfBirth: user.dateOfBirth,
    leaveBalance: user.leaveBalance,
  };

  // Include settings if they exist
  if (user.settings) {
    sanitized.settings = user.settings;
  }

  // Include timestamps if they exist
  if (user.createdAt) {
    sanitized.createdAt = user.createdAt;
  }
  if (user.updatedAt) {
    sanitized.updatedAt = user.updatedAt;
  }

  return sanitized;
};

// More restrictive sanitization for public-facing APIs or when extra security is needed
export const sanitizeUserDataMinimal = (user: any) => {
  return {
    id: user._id.toString(), // Use 'id' instead of '_id' to avoid exposing MongoDB specifics
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    department: user.department,
    jobTitle: user.jobTitle,
    avatar: user.avatar,
    leaveBalance: user.leaveBalance,
  };
};

// Ultra-secure sanitization for auth responses (only essential data)
export const sanitizeUserDataAuth = (user: any) => {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatar: user.avatar,
    // Only include essential leave balance for dashboard
    leaveBalance: {
      annual: user.leaveBalance?.annual || 0,
      sick: user.leaveBalance?.sick || 0,
      casual: user.leaveBalance?.casual || 0
    }
  };
};

// Function to sanitize an array of users
export const sanitizeUsersArray = (users: any[]): SanitizedUser[] => {
  return users.map(user => sanitizeUserData(user));
};

// Define which fields are safe to expose in API responses
export const SAFE_USER_FIELDS = [
  '_id',
  'email',
  'firstName', 
  'lastName',
  'role',
  'department',
  'jobTitle',
  'isActive',
  'hireDate',
  'avatar',
  'dateOfBirth',
  'leaveBalance',
  'settings',
  'createdAt',
  'updatedAt'
].join(' ');

// MongoDB select string to exclude sensitive fields
export const EXCLUDE_SENSITIVE_FIELDS = '-password -__v';

export const getTeamMembers = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.role === UserRole.MANAGER) {
        // If user is a manager, return all team members
        const members = await User.find({ managerId: userId });
        return members;
    } else {
        // If user is not a manager, return empty array
        return [];
    }
};