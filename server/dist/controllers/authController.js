"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const config_1 = require("../config/config");
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, department, jobTitle, managerId } = req.body;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        // Create new user
        const user = new User_1.User({
            email,
            password,
            firstName,
            lastName,
            role,
            department,
            jobTitle,
            managerId
        });
        await user.save();
        // Generate JWT token
        const payload = {
            userId: user._id.toString(),
            role: user.role
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret || 'fallback-secret', { expiresIn: '1d' });
        res.status(201).json({ user, token });
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating user' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User_1.User.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT token
        const payload = {
            userId: user._id.toString(),
            role: user.role
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret || 'fallback-secret', { expiresIn: '1d' });
        res.json({ user, token });
    }
    catch (error) {
        res.status(400).json({ error: 'Error logging in' });
    }
};
exports.login = login;
