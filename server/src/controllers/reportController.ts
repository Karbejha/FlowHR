import { Request, Response } from 'express';
import { User } from '../models/User';
import { logError } from '../utils/logger';

export const getEmployeeDemographics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all employees (excluding password)
    const employees = await User.find().select('-password');
    
    // Get the current date to calculate age and tenure
    const currentDate = new Date();
    
    // Department distribution
    const departmentDistribution = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Gender distribution (assuming we'd add this field to User model in the future)
    // For now, we'll return a placeholder
    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0,
      notSpecified: employees.length
    };
    
    // Age distribution
    const ageGroups = {
      'Under 25': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    };
    
    // Tenure distribution
    const tenureGroups = {
      'Less than 1 year': 0,
      '1-3 years': 0,
      '3-5 years': 0,
      '5-10 years': 0,
      'More than 10 years': 0
    };
    
    // Calculate age and tenure for each employee
    employees.forEach(employee => {
      // Calculate age
      if (employee.dateOfBirth) {
        const birthDate = new Date(employee.dateOfBirth);
        const age = currentDate.getFullYear() - birthDate.getFullYear();
        
        if (age < 25) ageGroups['Under 25']++;
        else if (age < 35) ageGroups['25-34']++;
        else if (age < 45) ageGroups['35-44']++;
        else if (age < 55) ageGroups['45-54']++;
        else ageGroups['55+']++;
      }
      
      // Calculate tenure
      if (employee.hireDate) {
        const hireDate = new Date(employee.hireDate);
        const tenureYears = currentDate.getFullYear() - hireDate.getFullYear();
        const tenureMonths = currentDate.getMonth() - hireDate.getMonth();
        const totalTenureMonths = tenureYears * 12 + tenureMonths;
        
        if (totalTenureMonths < 12) tenureGroups['Less than 1 year']++;
        else if (totalTenureMonths < 36) tenureGroups['1-3 years']++;
        else if (totalTenureMonths < 60) tenureGroups['3-5 years']++;
        else if (totalTenureMonths < 120) tenureGroups['5-10 years']++;
        else tenureGroups['More than 10 years']++;
      }
    });
    
    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Prepare the response
    const demographicsData = {
      totalEmployees: employees.length,
      departmentDistribution,
      roleDistribution,
      ageDistribution: Object.entries(ageGroups).map(([range, count]) => ({ range, count })),
      tenureDistribution: Object.entries(tenureGroups).map(([range, count]) => ({ range, count })),
      genderDistribution
    };
    
    res.json(demographicsData);
  } catch (error) {
    logError('Error fetching employee demographics', { error });
    res.status(500).json({ error: 'Error fetching employee demographics' });
  }
};
