import { Request, Response } from 'express';
import { 
  Onboarding, 
  Offboarding, 
  OnboardingStatus, 
  TaskStatus, 
  TaskCategory,
  OnboardingType,
  OffboardingType,
  DEFAULT_ONBOARDING_TASKS, 
  DEFAULT_OFFBOARDING_TASKS 
} from '../models/Onboarding';
import { User, UserRole } from '../models/User';
import { getTeamMembers } from '../utils/userUtils';
import { logError, logInfo } from '../utils/logger';
import mongoose from 'mongoose';

// ==================== ONBOARDING ====================

export const createOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to create onboarding' });
      return;
    }

    const {
      employeeId,
      type,
      startDate,
      targetCompletionDate,
      hrAssigneeId,
      buddyId,
      customTasks,
      requiredDocuments,
      equipmentList,
      accessList,
      trainingList,
      notes,
    } = req.body;

    // Validate employee
    const employee = await User.findById(employeeId);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Check for existing active onboarding
    const existingOnboarding = await Onboarding.findOne({
      employee: employeeId,
      status: { $in: [OnboardingStatus.NOT_STARTED, OnboardingStatus.IN_PROGRESS] },
    });

    if (existingOnboarding) {
      res.status(400).json({ error: 'An active onboarding process already exists for this employee' });
      return;
    }

    // Prepare tasks - use custom tasks if provided, otherwise use defaults
    const tasks = customTasks || DEFAULT_ONBOARDING_TASKS.map((task, index) => ({
      ...task,
      status: TaskStatus.PENDING,
      assignedTo: hrAssigneeId || req.user._id, // Default to HR assignee or creator
      order: index + 1,
      reminderSent: false,
    }));

    const onboarding = new Onboarding({
      employee: employeeId,
      type: type || OnboardingType.NEW_HIRE,
      status: OnboardingStatus.NOT_STARTED,
      startDate: new Date(startDate),
      targetCompletionDate: new Date(targetCompletionDate),
      tasks,
      hrAssignee: hrAssigneeId,
      buddy: buddyId,
      requiredDocuments: requiredDocuments || [
        { documentType: 'Personal ID', isSubmitted: false },
        { documentType: 'Employment Contract', isSubmitted: false },
        { documentType: 'Tax Forms', isSubmitted: false },
        { documentType: 'Bank Details', isSubmitted: false },
        { documentType: 'Emergency Contact', isSubmitted: false },
      ],
      equipmentList: equipmentList || [
        { item: 'Laptop', status: 'pending' },
        { item: 'Access Badge', status: 'pending' },
      ],
      accessList: accessList || [
        { system: 'Email', status: 'pending' },
        { system: 'HR System', status: 'pending' },
        { system: 'VPN', status: 'pending' },
      ],
      trainingList: trainingList || [
        { course: 'Security Awareness', isRequired: true, isCompleted: false },
        { course: 'Compliance Training', isRequired: true, isCompleted: false },
        { course: 'Company Policies', isRequired: true, isCompleted: false },
      ],
      notes,
    });

    await onboarding.save();
    await onboarding.populate('employee', 'firstName lastName email department');
    await onboarding.populate('hrAssignee', 'firstName lastName');
    await onboarding.populate('buddy', 'firstName lastName');

    logInfo('Onboarding created', { onboardingId: onboarding._id, employeeId, createdBy: req.user._id });
    res.status(201).json(onboarding);
  } catch (error) {
    logError('Error creating onboarding', { error: error instanceof Error ? error.message : error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error creating onboarding' });
  }
};

export const getOnboardings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { status, type } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    // Filter by team for managers
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      query.employee = { $in: teamMembers.map(m => m._id) };
    }

    const onboardings = await Onboarding.find(query)
      .sort({ startDate: -1 })
      .populate('employee', 'firstName lastName email department hireDate')
      .populate('hrAssignee', 'firstName lastName')
      .populate('buddy', 'firstName lastName');

    res.json(onboardings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching onboardings' });
  }
};

export const getMyOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    const onboarding = await Onboarding.findOne({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .populate('hrAssignee', 'firstName lastName email')
      .populate('buddy', 'firstName lastName email')
      .populate('tasks.assignedTo', 'firstName lastName')
      .populate('tasks.completedBy', 'firstName lastName');

    if (!onboarding) {
      res.status(404).json({ error: 'No onboarding found' });
      return;
    }

    res.json(onboarding);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching onboarding' });
  }
};

export const getOnboardingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { onboardingId } = req.params;

    const onboarding = await Onboarding.findById(onboardingId)
      .populate('employee', 'firstName lastName email department hireDate')
      .populate('hrAssignee', 'firstName lastName email')
      .populate('buddy', 'firstName lastName email')
      .populate('tasks.assignedTo', 'firstName lastName')
      .populate('tasks.completedBy', 'firstName lastName')
      .populate('requiredDocuments.documentId');

    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    // Check access
    const isEmployee = onboarding.employee._id.toString() === req.user._id.toString();
    const isHRAssignee = onboarding.hrAssignee?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    let isManager = false;

    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      isManager = teamMembers.some((m: any) => m._id.toString() === onboarding.employee._id.toString());
    }

    if (!isEmployee && !isHRAssignee && !isAdmin && !isManager) {
      res.status(403).json({ error: 'Not authorized to view this onboarding' });
      return;
    }

    res.json(onboarding);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching onboarding' });
  }
};

export const updateOnboardingTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { onboardingId, taskId } = req.params;
    const { status, notes } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    const task = onboarding.tasks.find((t: any) => t._id.toString() === taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Check if user can update this task
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    const isEmployee = onboarding.employee.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    const isHRAssignee = onboarding.hrAssignee?.toString() === req.user._id.toString();

    if (!isAssignee && !isAdmin && !isHRAssignee && !isEmployee) {
      res.status(403).json({ error: 'Not authorized to update this task' });
      return;
    }

    // Update task
    if (status) {
      task.status = status;
      if (status === TaskStatus.COMPLETED) {
        task.completedAt = new Date();
        task.completedBy = req.user._id;
      }
    }
    if (notes) {
      task.notes = notes;
    }

    // Start onboarding if first task is being worked on
    if (onboarding.status === OnboardingStatus.NOT_STARTED && 
        (status === TaskStatus.IN_PROGRESS || status === TaskStatus.COMPLETED)) {
      onboarding.status = OnboardingStatus.IN_PROGRESS;
    }

    await onboarding.save();
    logInfo('Onboarding task updated', { onboardingId, taskId, status, updatedBy: req.user._id });
    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error updating task' });
  }
};

export const addOnboardingTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { onboardingId } = req.params;
    const { title, description, category, dueDate, assignedTo, isRequired } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    const newTask = {
      title,
      description,
      category: category || TaskCategory.OTHER,
      status: TaskStatus.PENDING,
      assignedTo: assignedTo || req.user._id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      order: onboarding.tasks.length + 1,
      isRequired: isRequired !== undefined ? isRequired : true,
      reminderSent: false,
    };

    onboarding.tasks.push(newTask as any);
    await onboarding.save();

    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error adding task' });
  }
};

export const updateOnboardingDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { onboardingId } = req.params;
    const { requiredDocuments } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    // Update documents
    for (const doc of requiredDocuments) {
      const existing = onboarding.requiredDocuments.find(
        (d: any) => d.documentType === doc.documentType
      );
      if (existing) {
        existing.isSubmitted = doc.isSubmitted;
        existing.documentId = doc.documentId;
      } else {
        onboarding.requiredDocuments.push(doc);
      }
    }

    await onboarding.save();
    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error updating documents' });
  }
};

export const updateOnboardingEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { onboardingId } = req.params;
    const { equipmentList } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    onboarding.equipmentList = equipmentList;
    await onboarding.save();
    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error updating equipment' });
  }
};

export const updateOnboardingAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { onboardingId } = req.params;
    const { accessList } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    // Update access with granted info
    for (const access of accessList) {
      const existing = onboarding.accessList.find((a: any) => a.system === access.system);
      if (existing) {
        existing.status = access.status;
        if (access.status === 'granted') {
          existing.grantedAt = new Date();
          existing.grantedBy = req.user._id;
        }
      } else {
        onboarding.accessList.push(access);
      }
    }

    await onboarding.save();
    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error updating access' });
  }
};

export const updateOnboardingTraining = async (req: Request, res: Response): Promise<void> => {
  try {
    const { onboardingId } = req.params;
    const { trainingList } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    for (const training of trainingList) {
      const existing = onboarding.trainingList.find((t: any) => t.course === training.course);
      if (existing) {
        existing.isCompleted = training.isCompleted;
        if (training.isCompleted) {
          existing.completedAt = new Date();
        }
        existing.certificateUrl = training.certificateUrl;
      } else {
        onboarding.trainingList.push(training);
      }
    }

    await onboarding.save();
    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error updating training' });
  }
};

export const submitOnboardingFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { onboardingId } = req.params;
    const { score, comments } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    // Only employee can submit feedback
    if (onboarding.employee.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Only the employee can submit feedback' });
      return;
    }

    onboarding.feedbackCollected = true;
    onboarding.feedbackScore = score;
    onboarding.feedbackComments = comments;
    onboarding.feedbackCollectedAt = new Date();

    await onboarding.save();
    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error submitting feedback' });
  }
};

export const completeOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { onboardingId } = req.params;
    const onboarding = await Onboarding.findById(onboardingId);

    if (!onboarding) {
      res.status(404).json({ error: 'Onboarding not found' });
      return;
    }

    // Check if all required tasks are completed
    const incompleteTasks = onboarding.tasks.filter(
      (t: any) => t.isRequired && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.SKIPPED
    );

    if (incompleteTasks.length > 0) {
      res.status(400).json({ 
        error: 'Cannot complete onboarding. Required tasks are incomplete.',
        incompleteTasks: incompleteTasks.map((t: any) => t.title),
      });
      return;
    }

    onboarding.status = OnboardingStatus.COMPLETED;
    onboarding.actualCompletionDate = new Date();
    await onboarding.save();

    logInfo('Onboarding completed', { onboardingId, employeeId: onboarding.employee, completedBy: req.user._id });
    res.json(onboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error completing onboarding' });
  }
};

// ==================== OFFBOARDING ====================

export const createOffboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to create offboarding' });
      return;
    }

    const {
      employeeId,
      type,
      lastWorkingDate,
      noticeDate,
      exitDate,
      customTasks,
      equipmentToReturn,
      accessToRevoke,
      exitReasons,
      notes,
    } = req.body;

    // Validate employee
    const employee = await User.findById(employeeId);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Check for existing active offboarding
    const existingOffboarding = await Offboarding.findOne({
      employee: employeeId,
      status: { $in: [OnboardingStatus.NOT_STARTED, OnboardingStatus.IN_PROGRESS] },
    });

    if (existingOffboarding) {
      res.status(400).json({ error: 'An active offboarding process already exists for this employee' });
      return;
    }

    // Prepare tasks
    const tasks = customTasks || DEFAULT_OFFBOARDING_TASKS.map((task, index) => ({
      ...task,
      status: TaskStatus.PENDING,
      assignedTo: req.user._id,
      order: index + 1,
      reminderSent: false,
    }));

    const offboarding = new Offboarding({
      employee: employeeId,
      type: type || OffboardingType.RESIGNATION,
      status: OnboardingStatus.NOT_STARTED,
      lastWorkingDate: new Date(lastWorkingDate),
      noticeDate: new Date(noticeDate),
      exitDate: new Date(exitDate),
      tasks,
      equipmentToReturn: equipmentToReturn || [
        { item: 'Laptop', status: 'pending' },
        { item: 'Access Badge', status: 'pending' },
      ],
      accessToRevoke: accessToRevoke || [
        { system: 'Email', status: 'active' },
        { system: 'HR System', status: 'active' },
        { system: 'VPN', status: 'active' },
      ],
      exitReasons,
      clearances: [
        { department: 'IT', status: 'pending' },
        { department: 'Finance', status: 'pending' },
        { department: 'HR', status: 'pending' },
      ],
      exitDocuments: [
        { documentType: 'Experience Letter', status: 'pending' },
        { documentType: 'Final Settlement', status: 'pending' },
        { documentType: 'Exit Clearance', status: 'pending' },
      ],
    });

    await offboarding.save();
    await offboarding.populate('employee', 'firstName lastName email department');

    logInfo('Offboarding created', { offboardingId: offboarding._id, employeeId, createdBy: req.user._id });
    res.status(201).json(offboarding);
  } catch (error) {
    logError('Error creating offboarding', { error: error instanceof Error ? error.message : error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error creating offboarding' });
  }
};

export const getOffboardings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { status, type } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    // Filter by team for managers
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      query.employee = { $in: teamMembers.map(m => m._id) };
    }

    const offboardings = await Offboarding.find(query)
      .sort({ exitDate: 1 })
      .populate('employee', 'firstName lastName email department');

    res.json(offboardings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching offboardings' });
  }
};

export const getOffboardingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { offboardingId } = req.params;

    const offboarding = await Offboarding.findById(offboardingId)
      .populate('employee', 'firstName lastName email department')
      .populate('tasks.assignedTo', 'firstName lastName')
      .populate('tasks.completedBy', 'firstName lastName')
      .populate('exitInterviewConductedBy', 'firstName lastName')
      .populate('knowledgeTransferAssignee', 'firstName lastName')
      .populate('clearances.clearedBy', 'firstName lastName')
      .populate('accessToRevoke.revokedBy', 'firstName lastName');

    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    // Check access
    const isEmployee = offboarding.employee._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    let isManager = false;

    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      isManager = teamMembers.some((m: any) => m._id.toString() === offboarding.employee._id.toString());
    }

    if (!isEmployee && !isAdmin && !isManager) {
      res.status(403).json({ error: 'Not authorized to view this offboarding' });
      return;
    }

    res.json(offboarding);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching offboarding' });
  }
};

export const updateOffboardingTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { offboardingId, taskId } = req.params;
    const { status, notes } = req.body;

    const offboarding = await Offboarding.findById(offboardingId);
    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    const task = offboarding.tasks.find((t: any) => t._id.toString() === taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (status) {
      task.status = status;
      if (status === TaskStatus.COMPLETED) {
        task.completedAt = new Date();
        task.completedBy = req.user._id;
      }
    }
    if (notes) {
      task.notes = notes;
    }

    // Update offboarding status
    if (offboarding.status === OnboardingStatus.NOT_STARTED) {
      offboarding.status = OnboardingStatus.IN_PROGRESS;
    }

    // Calculate progress
    const completedTasks = offboarding.tasks.filter(
      (t: any) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.SKIPPED
    ).length;
    offboarding.progress = Math.round((completedTasks / offboarding.tasks.length) * 100);

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error updating task' });
  }
};

export const scheduleExitInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { offboardingId } = req.params;
    const { interviewDate, conductedBy } = req.body;

    const offboarding = await Offboarding.findById(offboardingId);
    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    offboarding.exitInterviewScheduled = true;
    offboarding.exitInterviewDate = new Date(interviewDate);
    offboarding.exitInterviewConductedBy = conductedBy || req.user._id;

    await offboarding.save();

    // TODO: Send calendar invite to employee

    res.json(offboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error scheduling exit interview' });
  }
};

export const submitExitInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { offboardingId } = req.params;
    const { notes, reasons, rehireEligible, rehireNotes } = req.body;

    const offboarding = await Offboarding.findById(offboardingId);
    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    offboarding.exitInterviewCompleted = true;
    offboarding.exitInterviewNotes = notes;
    offboarding.exitReasons = reasons;
    offboarding.rehireEligible = rehireEligible;
    offboarding.rehireNotes = rehireNotes;

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error submitting exit interview' });
  }
};

export const updateClearance = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { offboardingId } = req.params;
    const { department, status, notes } = req.body;

    const offboarding = await Offboarding.findById(offboardingId);
    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    const clearance = offboarding.clearances.find((c: any) => c.department === department);
    if (clearance) {
      clearance.status = status;
      clearance.notes = notes;
      if (status === 'cleared') {
        clearance.clearedBy = req.user._id;
        clearance.clearedAt = new Date();
      }
    } else {
      offboarding.clearances.push({
        department,
        status,
        clearedBy: status === 'cleared' ? req.user._id : undefined,
        clearedAt: status === 'cleared' ? new Date() : undefined,
        notes,
      });
    }

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error updating clearance' });
  }
};

export const updateEquipmentReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { offboardingId } = req.params;
    const { equipmentToReturn } = req.body;

    const offboarding = await Offboarding.findById(offboardingId);
    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    for (const item of equipmentToReturn) {
      const existing = offboarding.equipmentToReturn.find((e: any) => e.item === item.item);
      if (existing) {
        existing.status = item.status;
        existing.condition = item.condition;
        if (item.status === 'returned') {
          existing.returnedAt = new Date();
        }
      }
    }

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error updating equipment return' });
  }
};

export const revokeAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { offboardingId } = req.params;
    const { accessToRevoke } = req.body;

    const offboarding = await Offboarding.findById(offboardingId);
    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    for (const access of accessToRevoke) {
      const existing = offboarding.accessToRevoke.find((a: any) => a.system === access.system);
      if (existing) {
        existing.status = access.status;
        if (access.status === 'revoked') {
          existing.revokedAt = new Date();
          existing.revokedBy = req.user._id;
        }
      }
    }

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error revoking access' });
  }
};

export const calculateFinalSettlement = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { offboardingId } = req.params;
    const { finalPaymentAmount, ptoBalance } = req.body;

    const offboarding = await Offboarding.findById(offboardingId);
    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    offboarding.finalPaymentCalculated = true;
    offboarding.finalPaymentAmount = finalPaymentAmount;
    offboarding.ptoBalance = ptoBalance;

    await offboarding.save();
    res.json(offboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error calculating final settlement' });
  }
};

export const completeOffboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only admins can complete offboarding' });
      return;
    }

    const { offboardingId } = req.params;
    const offboarding = await Offboarding.findById(offboardingId);

    if (!offboarding) {
      res.status(404).json({ error: 'Offboarding not found' });
      return;
    }

    // Check clearances
    const pendingClearances = offboarding.clearances.filter((c: any) => c.status !== 'cleared');
    if (pendingClearances.length > 0) {
      res.status(400).json({ 
        error: 'Cannot complete offboarding. Pending clearances.',
        pendingClearances: pendingClearances.map((c: any) => c.department),
      });
      return;
    }

    // Deactivate employee
    await User.findByIdAndUpdate(offboarding.employee, { isActive: false });

    offboarding.status = OnboardingStatus.COMPLETED;
    await offboarding.save();

    logInfo('Offboarding completed', { offboardingId, employeeId: offboarding.employee, completedBy: req.user._id });
    res.json(offboarding);
  } catch (error) {
    res.status(400).json({ error: 'Error completing offboarding' });
  }
};

// ==================== ANALYTICS ====================

export const getOnboardingAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Active onboardings by status
    const onboardingByStatus = await Onboarding.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Average completion time
    const completedOnboardings = await Onboarding.find({
      status: OnboardingStatus.COMPLETED,
      actualCompletionDate: { $exists: true },
    });

    let avgCompletionDays = 0;
    if (completedOnboardings.length > 0) {
      const totalDays = completedOnboardings.reduce((sum, o) => {
        const days = Math.ceil(
          ((o.actualCompletionDate as Date).getTime() - o.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgCompletionDays = Math.round(totalDays / completedOnboardings.length);
    }

    // Average feedback score
    const feedbackScores = await Onboarding.aggregate([
      { $match: { feedbackCollected: true, feedbackScore: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$feedbackScore' } } },
    ]);

    // Onboardings by type
    const byType = await Onboarding.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({
      onboardingByStatus,
      avgCompletionDays,
      avgFeedbackScore: feedbackScores[0]?.avgScore || null,
      byType,
      totalActive: onboardingByStatus
        .filter((s: any) => s._id !== OnboardingStatus.COMPLETED)
        .reduce((sum: number, s: any) => sum + s.count, 0),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};

export const getOffboardingAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // By status
    const byStatus = await Offboarding.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // By type (reason for leaving)
    const byType = await Offboarding.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Exit reasons summary
    const exitReasons = await Offboarding.aggregate([
      { $unwind: '$exitReasons' },
      { $group: { _id: '$exitReasons', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Rehire eligibility
    const rehireStats = await Offboarding.aggregate([
      { $match: { rehireEligible: { $exists: true } } },
      { $group: { _id: '$rehireEligible', count: { $sum: 1 } } },
    ]);

    res.json({
      byStatus,
      byType,
      exitReasons,
      rehireStats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};

// Get default task templates
export const getOnboardingTaskTemplates = async (_req: Request, res: Response): Promise<void> => {
  res.json(DEFAULT_ONBOARDING_TASKS);
};

export const getOffboardingTaskTemplates = async (_req: Request, res: Response): Promise<void> => {
  res.json(DEFAULT_OFFBOARDING_TASKS);
};
