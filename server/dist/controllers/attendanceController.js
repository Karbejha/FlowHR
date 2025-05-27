"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttendance = exports.getTeamAttendance = exports.getMyAttendance = exports.clockOut = exports.clockIn = void 0;
const Attendance_1 = require("../models/Attendance");
const User_1 = require("../models/User");
const date_fns_1 = require("date-fns");
const clockIn = async (req, res) => {
    try {
        const now = new Date();
        const today = (0, date_fns_1.startOfDay)(now);
        let attendance = await Attendance_1.Attendance.findOne({
            employee: req.user._id,
            date: {
                $gte: today,
                $lt: (0, date_fns_1.endOfDay)(today)
            }
        });
        if (!attendance) {
            attendance = new Attendance_1.Attendance({
                employee: req.user._id,
                date: now,
                records: []
            });
        }
        // Check if there's an open record (clock-in without clock-out)
        const hasOpenRecord = attendance.records.some(record => !record.clockOut);
        if (hasOpenRecord) {
            res.status(400).json({ error: 'You already have an active clock-in' });
            return;
        }
        attendance.records.push({
            clockIn: now
        });
        await attendance.save();
        res.status(201).json(attendance);
    }
    catch (error) {
        res.status(400).json({ error: 'Error recording clock-in' });
    }
};
exports.clockIn = clockIn;
const clockOut = async (req, res) => {
    try {
        const now = new Date();
        const today = (0, date_fns_1.startOfDay)(now);
        const attendance = await Attendance_1.Attendance.findOne({
            employee: req.user._id,
            date: {
                $gte: today,
                $lt: (0, date_fns_1.endOfDay)(today)
            }
        });
        if (!attendance) {
            res.status(404).json({ error: 'No clock-in record found for today' });
            return;
        }
        // Find the last record without a clock-out
        const lastRecord = attendance.records
            .slice()
            .reverse()
            .find(record => !record.clockOut);
        if (!lastRecord) {
            res.status(400).json({ error: 'No active clock-in found' });
            return;
        }
        lastRecord.clockOut = now;
        attendance.calculateDuration(lastRecord.id);
        await attendance.save();
        res.json(attendance);
    }
    catch (error) {
        res.status(400).json({ error: 'Error recording clock-out' });
    }
};
exports.clockOut = clockOut;
const getMyAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { employee: req.user._id };
        if (startDate && endDate) {
            query.date = {
                $gte: (0, date_fns_1.startOfDay)(new Date(startDate)),
                $lt: (0, date_fns_1.endOfDay)(new Date(endDate))
            };
        }
        const attendance = await Attendance_1.Attendance.find(query)
            .sort({ date: -1 })
            .populate('employee', 'firstName lastName');
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching attendance records' });
    }
};
exports.getMyAttendance = getMyAttendance;
const getTeamAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            res.status(400).json({ error: 'Start date and end date are required' });
            return;
        }
        const query = {
            date: {
                $gte: (0, date_fns_1.startOfDay)(new Date(startDate)),
                $lt: (0, date_fns_1.endOfDay)(new Date(endDate))
            }
        };
        // If manager, only show their team's attendance
        if (req.user.role === User_1.UserRole.MANAGER) {
            const teamMembers = await User_1.User.find({ managerId: req.user._id });
            query.employee = { $in: teamMembers.map(member => member._id) };
        }
        const attendance = await Attendance_1.Attendance.find(query)
            .sort({ date: -1 })
            .populate('employee', 'firstName lastName department managerId');
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching team attendance records' });
    }
};
exports.getTeamAttendance = getTeamAttendance;
const updateAttendance = async (req, res) => {
    var _a;
    try {
        const { attendanceId } = req.params;
        const { status, notes } = req.body;
        const attendance = await Attendance_1.Attendance.findById(attendanceId)
            .populate('employee', 'firstName lastName managerId');
        if (!attendance) {
            res.status(404).json({ error: 'Attendance record not found' });
            return;
        }
        // Check if user has permission to update
        if (req.user.role === User_1.UserRole.MANAGER &&
            ((_a = attendance.employee.managerId) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user._id.toString()) {
            res.status(403).json({ error: 'Not authorized to update this attendance record' });
            return;
        }
        if (status)
            attendance.status = status;
        if (notes) {
            const lastRecord = attendance.records[attendance.records.length - 1];
            if (lastRecord) {
                lastRecord.notes = notes;
            }
        }
        await attendance.save();
        res.json(attendance);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating attendance record' });
    }
};
exports.updateAttendance = updateAttendance;
