"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamMembers = void 0;
const User_1 = require("../models/User");
const getTeamMembers = async (userId) => {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (user.role === User_1.UserRole.MANAGER) {
        // If user is a manager, return all team members
        const members = await User_1.User.find({ managerId: userId });
        return members;
    }
    else {
        // If user is not a manager, return empty array
        return [];
    }
};
exports.getTeamMembers = getTeamMembers;
