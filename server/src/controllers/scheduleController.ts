import { Request, Response } from 'express';
import { ReportSchedule, IReportSchedule } from '../models/ReportSchedule';
import { logError } from '../utils/logger';

// Get all report schedules for the authenticated user
export const getSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const schedules = await ReportSchedule.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(schedules);
  } catch (error) {
    logError('Error fetching report schedules:', error);
    res.status(500).json({ message: 'Error fetching report schedules' });
  }
};

// Get a single schedule by ID
export const getScheduleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const schedule = await ReportSchedule.findById(id)
      .populate('createdBy', 'firstName lastName email');
    
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }
    
    res.json(schedule);
  } catch (error) {
    logError('Error fetching schedule:', error);
    res.status(500).json({ message: 'Error fetching schedule' });
  }
};

// Create a new report schedule
export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      reportType,
      reportName,
      frequency,
      sendTime,
      recipients,
      filters,
      active
    } = req.body;
    
    // Validate required fields
    if (!reportType || !reportName || !frequency || !sendTime || !recipients || recipients.length === 0) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    
    const user = (req as any).user;
    
    const schedule = new ReportSchedule({
      reportType,
      reportName,
      frequency,
      sendTime,
      recipients,
      filters: filters || {},
      active: active !== undefined ? active : true,
      createdBy: user._id
    });
    
    await schedule.save();
    
    await schedule.populate('createdBy', 'firstName lastName email');
    
    res.status(201).json({
      message: 'Report schedule created successfully',
      schedule
    });
  } catch (error) {
    logError('Error creating report schedule:', error);
    res.status(500).json({ message: 'Error creating report schedule' });
  }
};

// Update a report schedule
export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      reportType,
      reportName,
      frequency,
      sendTime,
      recipients,
      filters,
      active
    } = req.body;
    
    const schedule = await ReportSchedule.findById(id);
    
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }
    
    // Update fields
    if (reportType) schedule.reportType = reportType;
    if (reportName) schedule.reportName = reportName;
    if (frequency) schedule.frequency = frequency;
    if (sendTime) schedule.sendTime = sendTime;
    if (recipients) schedule.recipients = recipients;
    if (filters !== undefined) schedule.filters = filters;
    if (active !== undefined) schedule.active = active;
    
    await schedule.save();
    await schedule.populate('createdBy', 'firstName lastName email');
    
    res.json({
      message: 'Report schedule updated successfully',
      schedule
    });
  } catch (error) {
    logError('Error updating report schedule:', error);
    res.status(500).json({ message: 'Error updating report schedule' });
  }
};

// Delete a report schedule
export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const schedule = await ReportSchedule.findByIdAndDelete(id);
    
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }
    
    res.json({ message: 'Report schedule deleted successfully' });
  } catch (error) {
    logError('Error deleting report schedule:', error);
    res.status(500).json({ message: 'Error deleting report schedule' });
  }
};

// Toggle schedule active status
export const toggleScheduleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const schedule = await ReportSchedule.findById(id);
    
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }
    
    schedule.active = !schedule.active;
    await schedule.save();
    await schedule.populate('createdBy', 'firstName lastName email');
    
    res.json({
      message: `Schedule ${schedule.active ? 'activated' : 'deactivated'} successfully`,
      schedule
    });
  } catch (error) {
    logError('Error toggling schedule status:', error);
    res.status(500).json({ message: 'Error toggling schedule status' });
  }
};

// Get schedules due for execution
export const getDueSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    
    const schedules = await ReportSchedule.find({
      active: true,
      nextRun: { $lte: now }
    }).populate('createdBy', 'firstName lastName email');
    
    res.json(schedules);
  } catch (error) {
    logError('Error fetching due schedules:', error);
    res.status(500).json({ message: 'Error fetching due schedules' });
  }
};

// Test email sending
export const testEmailSending = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ message: 'Email address is required' });
      return;
    }
    
    const { sendEmail } = await import('../utils/emailService');
    const { config } = await import('../config/config');
    
    // Check if email is configured
    if (!config.email.user || !config.email.pass) {
      res.status(500).json({ 
        message: 'Email service is not configured',
        details: 'Please configure EMAIL_USER and EMAIL_PASS in your .env file'
      });
      return;
    }
    
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✅ Email Test Successful!</h2>
        <p>This is a test email from your HR Management System.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Sent at: ${new Date().toLocaleString()}<br>
          From: ${config.email.from}
        </p>
      </div>
    `;
    
    await sendEmail(
      email,
      'Test Email from HR System',
      testHtml
    );
    
    res.json({ 
      message: 'Test email sent successfully',
      to: email,
      from: config.email.from
    });
  } catch (error) {
    logError('Error sending test email:', error);
    res.status(500).json({ 
      message: 'Error sending test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

