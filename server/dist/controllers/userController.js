"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeStatus = exports.getEmployees = void 0;
const User_1 = require("../models/User");
const getEmployees = async (req, res) => {
    try {
        let query = {};
        // If manager, only show their team members
        if (req.user.role === User_1.UserRole.MANAGER) {
            query = { managerId: req.user._id };
        }
        const employees = await User_1.User.find(query)
            .select('-password')
            .sort({ firstName: 1, lastName: 1 });
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching employees' });
    }
};
exports.getEmployees = getEmployees;
const updateEmployeeStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }
        // Prevent deactivating admins
        if (user.role === User_1.UserRole.ADMIN) {
            res.status(403).json({ error: 'Cannot modify admin status' });
            return;
        }
        user.isActive = isActive;
        await user.save();
        res.json({ message: 'Employee status updated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating employee status' });
    }
};
exports.updateEmployeeStatus = updateEmployeeStatus;
