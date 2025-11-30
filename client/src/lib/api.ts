import axios from 'axios';
import { 
  Payroll, 
  GeneratePayrollRequest, 
  BulkPayrollRequest, 
  UpdatePayrollRequest,
  PayrollReport 
} from '@/types/payroll';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Payroll API functions
export const payrollAPI = {
  // Generate payroll for a specific employee
  generatePayroll: async (data: GeneratePayrollRequest): Promise<Payroll> => {
    const response = await api.post('/payroll/generate', data);
    return response.data;
  },

  // Generate payroll for all employees
  generateBulkPayroll: async (data: BulkPayrollRequest): Promise<{message: string; results: {success: unknown[]; failed: unknown[]}}> => {
    const response = await api.post('/payroll/generate/bulk', data);
    return response.data;
  },

  // Get payroll by employee
  getPayrollByEmployee: async (employeeId: string, year?: number): Promise<Payroll[]> => {
    const response = await api.get(`/payroll/employee/${employeeId}`, {
      params: { year }
    });
    return response.data;
  },

  // Get all payrolls (admin/manager)
  getAllPayrolls: async (params?: {
    month?: number;
    year?: number;
    status?: string;
    department?: string;
  }): Promise<Payroll[]> => {
    const response = await api.get('/payroll', { params });
    return response.data;
  },

  // Get specific payroll
  getPayrollById: async (payrollId: string): Promise<Payroll> => {
    const response = await api.get(`/payroll/${payrollId}`);
    return response.data;
  },

  // Update payroll
  updatePayroll: async (payrollId: string, data: UpdatePayrollRequest): Promise<Payroll> => {
    const response = await api.put(`/payroll/${payrollId}`, data);
    return response.data;
  },

  // Approve payroll
  approvePayroll: async (payrollId: string, notes?: string): Promise<Payroll> => {
    const response = await api.patch(`/payroll/${payrollId}/approve`, { notes });
    return response.data;
  },

  // Mark as paid
  markAsPaid: async (payrollId: string, paymentDate?: string): Promise<Payroll> => {
    const response = await api.patch(`/payroll/${payrollId}/paid`, { paymentDate });
    return response.data;
  },

  // Delete payroll
  deletePayroll: async (payrollId: string): Promise<void> => {
    await api.delete(`/payroll/${payrollId}`);
  },

  // Generate payroll report
  getPayrollReport: async (month: number, year: number): Promise<PayrollReport> => {
    const response = await api.get(`/payroll/report/${month}/${year}`);
    return response.data;
  },

  // Get my payslips (employee view)
  getMyPayslips: async (year?: number): Promise<Payroll[]> => {
    const response = await api.get('/payroll/my-payslips', {
      params: { year }
    });
    return response.data;
  }
};

export default api;
