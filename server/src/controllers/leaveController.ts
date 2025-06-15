import { Request, Response } from 'express';
import { Leave, LeaveStatus } from '../models/Leave';
import { User, UserRole } from '../models/User';
import { getTeamMembers } from '../utils/userUtils';
import { sendLeaveRequestNotification, sendLeaveStatusUpdateNotification, sendAdminLeaveRequestNotification, formatDate } from '../utils/emailService';
import { 
  createLeaveRequestNotification, 
  createLeaveApprovalNotification, 
  createLeaveRejectionNotification 
} from './notificationController';
import { Document } from 'mongoose';
import { logError, logWarn } from '../utils/logger';

export const submitLeaveRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    // Convert leaveType to enum value
    const leave = new Leave({
      employee: req.user._id,
      leaveType: leaveType.toLowerCase(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: LeaveStatus.PENDING
    });

    // Calculate total days
    const totalDays = leave.calculateTotalDays();    // Validate leave balance before saving
    const hasBalance = await leave.validateLeaveBalance();
    if (!hasBalance) {
      res.status(400).json({ error: 'Insufficient leave balance' });
      return;
    }await leave.save();
    await leave.populate('employee', 'firstName lastName email department');
    
    // Send email notification to employee
    const employee = leave.employee as any;
    try {
      await sendLeaveRequestNotification(
        employee.email,
        `${employee.firstName} ${employee.lastName}`,
        leave.leaveType,
        formatDate(leave.startDate),
        formatDate(leave.endDate),
        totalDays,        leave.reason || 'No reason provided'
      );    } catch (emailError) {
      logError('Error sending leave request email notification', {
        employeeId: leave.employee,
        leaveId: leave._id,
        error: emailError instanceof Error ? emailError.message : emailError
      });
      // Don't fail the request if email fails
    }// Send admin notification
    const { config } = await import('../config/config');
    try {
      await sendAdminLeaveRequestNotification(
        config.email.adminEmail,
        `${employee.firstName} ${employee.lastName}`,
        employee.email,
        leave.leaveType,
        formatDate(leave.startDate),
        formatDate(leave.endDate),
        totalDays,
        leave.reason || 'No reason provided',        employee.department
      );    } catch (emailError) {
      logError('Error sending admin leave request notification', {
        employeeId: leave.employee,
        leaveId: leave._id,
        adminEmail: config.email.adminEmail,
        error: emailError instanceof Error ? emailError.message : emailError
      });
      // Don't fail the request if email fails
    }

    // Create in-app notification for managers/admins
    try {
      // Find managers and admins to notify
      const managersAndAdmins = await User.find({
        $or: [
          { role: UserRole.ADMIN },
          { role: UserRole.MANAGER }
        ]
      });      // Create notifications for each manager/admin
      for (const manager of managersAndAdmins) {
        await createLeaveRequestNotification(
          (manager._id as any).toString(),
          `${employee.firstName} ${employee.lastName}`,
          leave.leaveType,
          formatDate(leave.startDate),
          formatDate(leave.endDate)
        );      }    } catch (notificationError) {
      logError('Error creating leave request notifications', {
        employeeId: leave.employee,
        leaveId: leave._id,
        error: notificationError instanceof Error ? notificationError.message : notificationError
      });
      // Don't fail the request if notification creation fails
    }
    
    res.status(201).json(leave);
  } catch (error) {
    logError('Leave request error', {
      employeeId: (req as any).user?.id,
      error: error instanceof Error ? error.message : error
    });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error submitting leave request' });
  }
};

export const getMyLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .populate('employee', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching leave requests' });
  }
};

export const getPendingLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    let query: { status: LeaveStatus; employee?: any } = { 
      status: LeaveStatus.PENDING 
    };
    
    // If manager, only show their team's requests
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      query.employee = { 
        $in: teamMembers.map(member => member._id) 
      };
    }
    
    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate('employee', 'firstName lastName department')
      .populate('approvedBy', 'firstName lastName');
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending leave requests' });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaveId } = req.params;
    const { status, approvalNotes } = req.body;
      // Debug logs
    console.log('Update leave status request:', { 
      leaveId, 
      body: req.body,
      userRole: req.user.role,
      statusReceived: status,
      statusType: typeof status,
      validStatuses: Object.values(LeaveStatus)
    });
    
    // Validate input
    if (!status || !Object.values(LeaveStatus).includes(status as LeaveStatus)) {
      console.error('Invalid status value:', status, 'Valid values:', Object.values(LeaveStatus));
      res.status(400).json({ error: `Invalid status value: ${status}. Valid values are: ${Object.values(LeaveStatus).join(', ')}` });
      return;
    }

    const leave = await Leave.findById(leaveId)
      .populate('employee', 'firstName lastName email leaveBalance');

    if (!leave) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }

    // Check if user has permission to approve/reject
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      const teamMemberIds = teamMembers.map(member => (member as unknown as Document).id);
      const employeeId = (leave.employee as any)._id.toString();
      
      if (!teamMemberIds.includes(employeeId)) {
        res.status(403).json({ error: 'Not authorized to update this leave request' });
        return;
      }
    }

    // Only deduct balance when status changes to approved
    if (status === LeaveStatus.APPROVED && leave.status !== LeaveStatus.APPROVED) {
      const user = await User.findById((leave.employee as any)._id);
      if (!user) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }      // Initialize leave balance if not set
      if (!user.leaveBalance) {
        user.leaveBalance = {
          annual: 20,
          sick: 10,
          casual: 5,
          unpaid: 0,
          maternity: 0,
          paternity: 0,
          other: 0
        };
        // Use findByIdAndUpdate to bypass validation for this specific update
        await User.findByIdAndUpdate(user._id, { leaveBalance: user.leaveBalance }, { runValidators: false });
      }

      const balanceType = leave.leaveType.toLowerCase() as keyof typeof user.leaveBalance;
      const currentBalance = user.leaveBalance[balanceType] || 0;
      if (currentBalance < leave.totalDays) {
        res.status(400).json({ error: 'Insufficient leave balance' });
        return;
      }

      // Deduct the leave balance
      user.leaveBalance[balanceType] = currentBalance - leave.totalDays;
      // Use findByIdAndUpdate to bypass validation when only updating leave balance
      await User.findByIdAndUpdate(user._id, { leaveBalance: user.leaveBalance }, { runValidators: false });
    }    // Restore balance if previously approved leave is now rejected/cancelled
    if (leave.status === LeaveStatus.APPROVED && 
        (status === LeaveStatus.REJECTED || status === LeaveStatus.CANCELLED)) {
      const user = await User.findById((leave.employee as any)._id);
      if (user?.leaveBalance) {
        const balanceType = leave.leaveType.toLowerCase() as keyof typeof user.leaveBalance;
        const currentBalance = user.leaveBalance[balanceType] || 0;
        user.leaveBalance[balanceType] = currentBalance + leave.totalDays;
        // Use findByIdAndUpdate to bypass validation when only updating leave balance
        await User.findByIdAndUpdate(user._id, { leaveBalance: user.leaveBalance }, { runValidators: false });
      }
    }

    leave.status = status;
    leave.approvalNotes = approvalNotes;
    leave.approvedBy = req.user._id;
    leave.approvalDate = new Date();    await leave.save();
    
    // Send email notification for status update
    const employee = leave.employee as any;
    try {
      await sendLeaveStatusUpdateNotification(
        employee.email,
        `${employee.firstName} ${employee.lastName}`,
        leave.leaveType,
        formatDate(leave.startDate),
        formatDate(leave.endDate),
        leave.totalDays,        status,
        `${req.user.firstName} ${req.user.lastName}`,
        approvalNotes
      );
    } catch (emailError) {
      logError('Error sending leave status update email notification', {
        employeeId: leave.employee,
        leaveId: leave._id,
        status,
        error: emailError instanceof Error ? emailError.message : emailError
      });
      // Don't fail the request if email fails
    }

    // Create in-app notification for employee
    try {
      if (status === LeaveStatus.APPROVED) {
        await createLeaveApprovalNotification(
          employee._id.toString(),
          leave.leaveType,
          formatDate(leave.startDate),
          formatDate(leave.endDate)
        );
      } else if (status === LeaveStatus.REJECTED) {
        await createLeaveRejectionNotification(
          employee._id.toString(),
          leave.leaveType,
          formatDate(leave.startDate),
          formatDate(leave.endDate),          approvalNotes
        );
      }
    } catch (notificationError) {
      logError('Error creating leave status notification', {
        employeeId: leave.employee,
        leaveId: leave._id,
        status,
        error: notificationError instanceof Error ? notificationError.message : notificationError
      });
      // Don't fail the request if notification creation fails
    }
      res.json(leave);
  } catch (error) {
    console.error('Error in updateLeaveStatus:', error);
    logError('Leave status update error', {
      leaveId: req.params.leaveId,
      requestBody: req.body,
      userId: req.user._id,
      error: error instanceof Error ? error.message : error
    });
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Error updating leave status' 
    });
  }
};

export const cancelLeaveRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaveId } = req.params;
    const leave = await Leave.findById(leaveId);

    if (!leave) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }

    // Only allow cancellation of own pending requests
    if (leave.employee.toString() !== req.user._id.toString() || 
        leave.status !== LeaveStatus.PENDING) {
      res.status(403).json({ error: 'Cannot cancel this leave request' });
      return;
    }

    leave.status = LeaveStatus.CANCELLED;
    await leave.save();

    res.json(leave);
  } catch (error) {
    res.status(400).json({ error: 'Error cancelling leave request' });
  }
};

export const getLeaveBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('leaveBalance');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user.leaveBalance);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching leave balance' });
  }
};

export const getAllLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    let query: { employee?: any } = {};
    
    // If manager, only show their team's requests
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      query.employee = { 
        $in: teamMembers.map(member => member._id) 
      };
    }
    // Admins can see all requests (no additional filtering)
    
    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate('employee', 'firstName lastName department')
      .populate('approvedBy', 'firstName lastName');
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching leave requests' });
  }
};

// New function to get leave requests for a specific month
export const getMonthlyLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month } = req.query;
    const monthNum = parseInt(month as string, 10);
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      res.status(400).json({ error: 'Invalid month parameter. Must be between 1-12.' });
      return;
    }

    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // Create start and end dates for the month
    const startDate = new Date(currentYear, monthNum - 1, 1);
    const endDate = new Date(currentYear, monthNum, 0); // Last day of the month
    
    console.log(`Fetching leave requests between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    // Find leaves that overlap with the month
    // A leave request overlaps with the month if:
    // - The start date is within the month, OR
    // - The end date is within the month, OR
    // - The start date is before the month AND the end date is after the month
    const leaves = await Leave.find({
      $and: [
        { status: LeaveStatus.APPROVED }, // Only show approved leaves
        {
          $or: [
            // Start date falls within the month
            {
              startDate: {
                $gte: startDate,
                $lte: endDate
              }
            },
            // End date falls within the month
            {
              endDate: {
                $gte: startDate,
                $lte: endDate
              }
            },
            // Leave spans across the month
            {
              startDate: { $lt: startDate },
              endDate: { $gt: endDate }
            }
          ]
        }
      ]
    })
    .populate('employee', 'firstName lastName avatar dateOfBirth')
    .sort({ startDate: 1 });
    
    console.log(`Found ${leaves.length} leave requests for month ${monthNum}`);
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching monthly leave requests:', error);
    res.status(500).json({ 
      error: 'Error fetching monthly leave requests', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
};