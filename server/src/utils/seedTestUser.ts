import { User, UserRole } from '../models/User';
import bcrypt from 'bcryptjs';
import { logInfo, logError } from '../utils/logger';

/**
 * Seed a test user with a birthday in June for testing the birthday feature
 */
export const seedTestUser = async () => {
  try {
    // Check if we already have a test user
    const existingUser = await User.findOne({ email: 'test.june@example.com' });
    if (existingUser) {
      logInfo('Test user already exists, skipping seeding');
      return;
    }

    // Create a date in June (current month)
    const currentYear = new Date().getFullYear();
    const birthdayDate = new Date(currentYear - 30, 5, 15); // June 15th (month is 0-indexed)
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create test user
    const testUser = new User({
      email: 'test.june@example.com',
      password: hashedPassword,
      firstName: 'June',
      lastName: 'Birthday',
      role: UserRole.EMPLOYEE,
      department: 'Testing',
      jobTitle: 'Test Engineer',
      dateOfBirth: birthdayDate,
      hireDate: new Date(),
      isActive: true,
      leaveBalance: {
        annual: 20,
        sick: 10,
        casual: 5
      }
    });
    
    await testUser.save();
    logInfo('Test user with June birthday created successfully');
  } catch (error) {
    logError('Error seeding test user', {
      error: error instanceof Error ? error.message : error
    });
  }
};
