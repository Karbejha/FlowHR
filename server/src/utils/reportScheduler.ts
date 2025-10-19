import * as cron from 'node-cron';
import { ReportSchedule, ScheduleFrequency } from '../models/ReportSchedule';
import { sendEmail } from './emailService';
import { logInfo, logError } from './logger';
import { config } from '../config/config';

let schedulerTask: cron.ScheduledTask | null = null;

// Execute a scheduled report
async function executeScheduledReport(schedule: any) {
  try {
    logInfo('Executing scheduled report', {
      scheduleId: schedule._id,
      reportType: schedule.reportType,
      recipients: schedule.recipients
    });

    // Generate report URL (in a real scenario, you would generate the report and attach it)
    const reportUrl = `${config.clientUrl}/reports/${schedule.reportType}`;
    
    const emailSubject = `Scheduled Report: ${schedule.reportName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Scheduled Report: ${schedule.reportName}</h2>
        <p>Your scheduled report is ready.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Report Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Report Type:</strong> ${schedule.reportType}</li>
            <li><strong>Frequency:</strong> ${schedule.frequency}</li>
            <li><strong>Generated:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        
        <p>
          <a href="${reportUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            View Report
          </a>
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated report from your HR Management System.
        </p>
      </div>
    `;

    // Send email to all recipients
    for (const recipient of schedule.recipients) {
      try {
        await sendEmail(recipient, emailSubject, emailHtml);
        logInfo('Report email sent successfully', {
          scheduleId: schedule._id,
          recipient
        });
      } catch (emailError) {
        logError('Failed to send report email', {
          scheduleId: schedule._id,
          recipient,
          error: emailError
        });
      }
    }

    // Update schedule's lastRun and calculate nextRun
    schedule.lastRun = new Date();
    schedule.nextRun = schedule.calculateNextRun();
    await schedule.save();

    logInfo('Schedule updated after execution', {
      scheduleId: schedule._id,
      lastRun: schedule.lastRun,
      nextRun: schedule.nextRun
    });

  } catch (error) {
    logError('Error executing scheduled report', {
      scheduleId: schedule._id,
      error
    });
  }
}

// Check for due schedules and execute them
async function checkAndExecuteDueSchedules() {
  try {
    const now = new Date();
    
    const dueSchedules = await ReportSchedule.find({
      active: true,
      nextRun: { $lte: now }
    }).populate('createdBy', 'firstName lastName email');

    if (dueSchedules.length > 0) {
      logInfo(`Found ${dueSchedules.length} due schedule(s) to execute`);
      
      for (const schedule of dueSchedules) {
        await executeScheduledReport(schedule);
      }
    }
  } catch (error) {
    logError('Error checking due schedules', { error });
  }
}

// Initialize the report scheduler
export function initializeReportScheduler() {
  if (schedulerTask) {
    logInfo('Report scheduler is already running');
    return;
  }

  // Run every minute to check for due schedules
  schedulerTask = cron.schedule('* * * * *', async () => {
    await checkAndExecuteDueSchedules();
  });

  logInfo('Report scheduler initialized - checking every minute');
}

// Stop the scheduler
export function stopReportScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    logInfo('Report scheduler stopped');
  }
}

// Export for manual testing
export { checkAndExecuteDueSchedules };

