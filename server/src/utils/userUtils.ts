import { User, UserRole } from '../models/User';

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