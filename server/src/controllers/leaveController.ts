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
        totalDays,
        leave.reason || 'No reason provided'
      );
    } catch (emailError) {
      console.error('Error sending leave request email notification:', emailError);
      // Don't fail the request if email fails
    }    // Send admin notification
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
        leave.reason || 'No reason provided',
        employee.department
      );
    } catch (emailError) {
      console.error('Error sending admin leave request notification:', emailError);
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
        );
      }
    } catch (notificationError) {
      console.error('Error creating leave request notifications:', notificationError);
      // Don't fail the request if notification creation fails
    }
    
    res.status(201).json(leave);
  } catch (error) {
    console.error('Leave request error:', error);
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
        await user.save();
      }

      const balanceType = leave.leaveType.toLowerCase() as keyof typeof user.leaveBalance;
      const currentBalance = user.leaveBalance[balanceType] || 0;
      if (currentBalance < leave.totalDays) {
        res.status(400).json({ error: 'Insufficient leave balance' });
        return;
      }

      // Deduct the leave balance
      user.leaveBalance[balanceType] = currentBalance - leave.totalDays;
      await user.save();
    }    // Restore balance if previously approved leave is now rejected/cancelled
    if (leave.status === LeaveStatus.APPROVED && 
        (status === LeaveStatus.REJECTED || status === LeaveStatus.CANCELLED)) {
      const user = await User.findById((leave.employee as any)._id);
      if (user?.leaveBalance) {
        const balanceType = leave.leaveType.toLowerCase() as keyof typeof user.leaveBalance;
        const currentBalance = user.leaveBalance[balanceType] || 0;
        user.leaveBalance[balanceType] = currentBalance + leave.totalDays;
        await user.save();
      }
    }leave.status = status;
    leave.approvalNotes = approvalNotes;
    leave.approvedBy = req.user._id;
    leave.approvalDate = new Date();

    await leave.save();
      // Send email notification for status update
    const employee = leave.employee as any;
    try {
      await sendLeaveStatusUpdateNotification(
        employee.email,
        `${employee.firstName} ${employee.lastName}`,
        leave.leaveType,
        formatDate(leave.startDate),
        formatDate(leave.endDate),
        leave.totalDays,
        status,
        `${req.user.firstName} ${req.user.lastName}`,
        approvalNotes
      );
    } catch (emailError) {
      console.error('Error sending leave status update email notification:', emailError);
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
          formatDate(leave.endDate),
          approvalNotes
        );
      }
    } catch (notificationError) {
      console.error('Error creating leave status notification:', notificationError);
      // Don't fail the request if notification creation fails
    }
    
    res.json(leave);
  } catch (error) {
    res.status(400).json({ error: 'Error updating leave status' });
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