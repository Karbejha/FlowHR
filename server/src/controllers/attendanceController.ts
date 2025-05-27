import { Request, Response } from 'express';
import { Attendance } from '../models/Attendance';
import { User, UserRole } from '../models/User';
import { startOfDay, endOfDay } from 'date-fns';
import mongoose from 'mongoose';

interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  managerId?: mongoose.Types.ObjectId;
}

export const clockIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const today = startOfDay(now);

    let attendance = await Attendance.findOne({
      employee: req.user._id,
      date: {
        $gte: today,
        $lt: endOfDay(today)
      }
    });

    if (!attendance) {
      attendance = new Attendance({
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
  } catch (error) {
    res.status(400).json({ error: 'Error recording clock-in' });
  }
};

export const clockOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const today = startOfDay(now);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: {
        $gte: today,
        $lt: endOfDay(today)
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
  } catch (error) {
    res.status(400).json({ error: 'Error recording clock-out' });
  }
};

export const getMyAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = { employee: req.user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: startOfDay(new Date(startDate as string)),
        $lt: endOfDay(new Date(endDate as string))
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('employee', 'firstName lastName');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching attendance records' });
  }
};

export const getTeamAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }

    const query: any = {
      date: {
        $gte: startOfDay(new Date(startDate as string)),
        $lt: endOfDay(new Date(endDate as string))
      }
    };

    // If manager, only show their team's attendance
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await User.find({ managerId: req.user._id }) as UserDocument[];
      query.employee = { $in: teamMembers.map(member => member._id) };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('employee', 'firstName lastName department managerId');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching team attendance records' });
  }
};

export const updateAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attendanceId } = req.params;
    const { status, notes } = req.body;

    const attendance = await Attendance.findById(attendanceId)
      .populate<{ employee: UserDocument }>('employee', 'firstName lastName managerId');

    if (!attendance) {
      res.status(404).json({ error: 'Attendance record not found' });
      return;
    }

    // Check if user has permission to update
    if (req.user.role === UserRole.MANAGER && 
        attendance.employee.managerId?.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Not authorized to update this attendance record' });
      return;
    }

    if (status) attendance.status = status;
    if (notes) {
      const lastRecord = attendance.records[attendance.records.length - 1];
      if (lastRecord) {
        lastRecord.notes = notes;
      }
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ error: 'Error updating attendance record' });
  }
};