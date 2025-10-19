import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logInfo, logWarn, logError } from './logger';
import { LeaveStatus } from '../models/Leave';

// Create email transporter
const createTransporter = () => {
  if (!config.email.user || !config.email.pass) {
    logWarn('Email credentials not configured. Email notifications will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: config.email.service,
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  leaveRequestSubmitted: (employeeName: string, leaveType: string, startDate: string, endDate: string, totalDays: number, reason: string) => ({
    subject: 'Leave Request Submitted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Leave Request Submitted</h1>
            <div style="width: 50px; height: 3px; background-color: #3b82f6; margin: 10px auto;"></div>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${employeeName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Your leave request has been successfully submitted and is now pending approval. Here are the details:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Leave Type:</td>
                <td style="padding: 8px 0; color: #6b7280;">${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Start Date:</td>
                <td style="padding: 8px 0; color: #6b7280;">${startDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">End Date:</td>
                <td style="padding: 8px 0; color: #6b7280;">${endDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Total Days:</td>
                <td style="padding: 8px 0; color: #6b7280;">${totalDays} day${totalDays > 1 ? 's' : ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Reason:</td>
                <td style="padding: 8px 0; color: #6b7280;">${reason}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            You will receive another email notification once your manager or administrator reviews your request.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated message from the HR Management System.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  leaveRequestApproved: (employeeName: string, leaveType: string, startDate: string, endDate: string, totalDays: number, approverName: string, approvalNotes?: string) => ({
    subject: '✅ Leave Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">✓</span>
            </div>
            <h1 style="color: #10b981; margin: 0;">Leave Request Approved!</h1>
            <div style="width: 50px; height: 3px; background-color: #10b981; margin: 10px auto;"></div>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${employeeName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Great news! Your leave request has been <strong style="color: #10b981;">approved</strong> by ${approverName}.
          </p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Leave Type:</td>
                <td style="padding: 8px 0; color: #6b7280;">${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Start Date:</td>
                <td style="padding: 8px 0; color: #6b7280;">${startDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">End Date:</td>
                <td style="padding: 8px 0; color: #6b7280;">${endDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Total Days:</td>
                <td style="padding: 8px 0; color: #6b7280;">${totalDays} day${totalDays > 1 ? 's' : ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Approved By:</td>
                <td style="padding: 8px 0; color: #6b7280;">${approverName}</td>
              </tr>
              ${approvalNotes ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Notes:</td>
                <td style="padding: 8px 0; color: #6b7280;">${approvalNotes}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Please ensure you have completed any necessary handovers before your leave begins.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated message from the HR Management System.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  leaveRequestRejected: (employeeName: string, leaveType: string, startDate: string, endDate: string, totalDays: number, approverName: string, approvalNotes?: string) => ({
    subject: '❌ Leave Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background-color: #ef4444; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">✕</span>
            </div>
            <h1 style="color: #ef4444; margin: 0;">Leave Request Rejected</h1>
            <div style="width: 50px; height: 3px; background-color: #ef4444; margin: 10px auto;"></div>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${employeeName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We regret to inform you that your leave request has been <strong style="color: #ef4444;">rejected</strong> by ${approverName}.
          </p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Leave Type:</td>
                <td style="padding: 8px 0; color: #6b7280;">${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Start Date:</td>
                <td style="padding: 8px 0; color: #6b7280;">${startDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">End Date:</td>
                <td style="padding: 8px 0; color: #6b7280;">${endDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Total Days:</td>
                <td style="padding: 8px 0; color: #6b7280;">${totalDays} day${totalDays > 1 ? 's' : ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Rejected By:</td>
                <td style="padding: 8px 0; color: #6b7280;">${approverName}</td>
              </tr>
              ${approvalNotes ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Reason:</td>
                <td style="padding: 8px 0; color: #6b7280;">${approvalNotes}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            If you have any questions about this decision, please contact your manager or HR department.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated message from the HR Management System.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Admin notification template for new leave requests
  leaveRequestAdminNotification: (employeeName: string, employeeEmail: string, leaveType: string, startDate: string, endDate: string, totalDays: number, reason: string, employeeDepartment?: string) => ({
    subject: '🔔 New Leave Request Submitted - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">📋</span>
            </div>
            <h1 style="color: #667eea; margin: 0;">New Leave Request</h1>
            <div style="width: 50px; height: 3px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 10px auto;"></div>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            A new leave request has been submitted and requires your review.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #495057;">Employee Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Employee:</td>
                <td style="padding: 8px 0; color: #6b7280;">${employeeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #6b7280;">${employeeEmail}</td>
              </tr>
              ${employeeDepartment ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Department:</td>
                <td style="padding: 8px 0; color: #6b7280;">${employeeDepartment}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3 style="margin-top: 0; color: #495057;">Leave Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Leave Type:</td>
                <td style="padding: 8px 0; color: #6b7280;">${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Start Date:</td>
                <td style="padding: 8px 0; color: #6b7280;">${startDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">End Date:</td>
                <td style="padding: 8px 0; color: #6b7280;">${endDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Total Days:</td>
                <td style="padding: 8px 0; color: #6b7280;">${totalDays} day${totalDays > 1 ? 's' : ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    PENDING REVIEW
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Reason:</td>
                <td style="padding: 8px 0; color: #6b7280;">${reason}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-weight: bold;">⏰ Action Required</p>
            <p style="margin: 5px 0 0 0; color: #856404;">Please log into the HR system to review and approve/reject this leave request.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated notification from the HR Management System.
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  })
};

// Email sending functions
export const sendLeaveRequestNotification = async (
  employeeEmail: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  totalDays: number,  reason: string
): Promise<void> => {
  if (!transporter) {
    logWarn('Email transporter not configured. Skipping email notification.');
    return;
  }

  try {
    const template = emailTemplates.leaveRequestSubmitted(employeeName, leaveType, startDate, endDate, totalDays, reason);    await transporter.sendMail({
      from: config.email.from,
      to: employeeEmail,
      subject: template.subject,
      html: template.html
    });

    logInfo('Leave request notification sent successfully', { 
      to: employeeEmail, 
      leaveType, 
      startDate, 
      endDate 
    });
  } catch (error) {
    logError('Error sending leave request notification', { error, to: employeeEmail });
  }
};

export const sendLeaveStatusUpdateNotification = async (
  employeeEmail: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  totalDays: number,
  status: LeaveStatus,
  approverName: string,  approvalNotes?: string
): Promise<void> => {
  if (!transporter) {
    logWarn('Email transporter not configured. Skipping email notification.');
    return;
  }

  try {
    let template;
    
    if (status === LeaveStatus.APPROVED) {
      template = emailTemplates.leaveRequestApproved(employeeName, leaveType, startDate, endDate, totalDays, approverName, approvalNotes);
    } else if (status === LeaveStatus.REJECTED) {
      template = emailTemplates.leaveRequestRejected(employeeName, leaveType, startDate, endDate, totalDays, approverName, approvalNotes);
    } else {
      // Don't send email for other status changes
      return;
    }    await transporter.sendMail({
      from: config.email.from,
      to: employeeEmail,
      subject: template.subject,
      html: template.html
    });    // Success - no need to log every email send in production
  } catch (error) {
    logError('Error sending leave status update notification', {
      employeeEmail,
      employeeName,
      leaveType,
      status,
      error: error instanceof Error ? error.message : error
    });
  }
};

export const sendLeaveRequestAdminNotification = async (
  adminEmail: string,
  employeeName: string,
  employeeEmail: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  totalDays: number,
  reason: string,
  employeeDepartment?: string
): Promise<void> => {  if (!transporter) {
    logWarn('Email transporter not configured. Skipping email notification.', {
      operation: 'sendLeaveRequestEmail',
      employeeEmail,
      leaveType
    });
    return;
  }

  try {
    const template = emailTemplates.leaveRequestAdminNotification(employeeName, employeeEmail, leaveType, startDate, endDate, totalDays, reason, employeeDepartment);
      await transporter.sendMail({
      from: config.email.from,
      to: adminEmail,
      subject: template.subject,
      html: template.html
    });    // Success - no need to log every email send in production
  } catch (error) {
    logError('Error sending leave request admin notification', {
      adminEmail,
      employeeName,
      employeeEmail,
      leaveType,
      error: error instanceof Error ? error.message : error
    });
  }
};

// Send admin notification when a leave request is submitted
export const sendAdminLeaveRequestNotification = async (
  adminEmail: string,
  employeeName: string,
  employeeEmail: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  totalDays: number,
  reason: string,
  employeeDepartment?: string
): Promise<void> => {  if (!transporter) {
    logWarn('Email transporter not configured. Skipping admin notification.', {
      operation: 'sendAdminNotificationEmail',
      employeeEmail,
      leaveType
    });
    return;
  }

  try {
    const template = emailTemplates.leaveRequestAdminNotification(
      employeeName, 
      employeeEmail, 
      leaveType, 
      startDate, 
      endDate, 
      totalDays, 
      reason,
      employeeDepartment
    );
      await transporter.sendMail({
      from: config.email.from,
      to: adminEmail,
      subject: template.subject,
      html: template.html
    });    // Success - no need to log every email send in production
  } catch (error) {
    logError('Error sending admin leave request notification', {
      adminEmail,
      employeeName,
      employeeEmail,
      leaveType,
      error: error instanceof Error ? error.message : error
    });
  }
};

// Generic email sending function for reports and other purposes
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>
): Promise<void> => {
  if (!transporter) {
    logWarn('Email transporter not configured. Skipping email notification.', {
      operation: 'sendEmail',
      to,
      subject
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      attachments
    });

    logInfo('Email sent successfully', { to, subject });
  } catch (error) {
    logError('Error sending email', {
      to,
      subject,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
};

// Utility function to format date
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
