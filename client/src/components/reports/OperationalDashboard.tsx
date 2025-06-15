'use client';

import { useTranslation } from '@/contexts/I18nContext';
import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { isRTL } from '@/lib/i18n-config';

// Define shared color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Type definitions
interface TimeAttendanceData {
  totalRecords: number;
  onTime: number;
  late: number;
  earlyDeparture: number;
  absent: number;
  workHoursByDepartment: Record<string, { total: number, count: number, average: number }>;
  attendanceByDay: Record<string, number>;
  averageWorkHours: number;
  latePercentage: number;
}

interface LeaveUsageData {
  totalLeaveRequests: number;
  totalDaysTaken: number;
  leaveByType: Record<string, number>;
  leaveByDepartment: Record<string, number>;
  leaveByMonth: number[];
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

interface ResourceAllocationData {
  totalEmployees: number;
  employeesByDepartment: Record<string, number>;
  employeesByRole: Record<string, number>;
  departmentAllocation: Array<{ department: string; count: number; percentage: number }>;
  roleDistribution: Array<{ role: string; count: number; percentage: number }>;
  projectAllocation: Array<{ projectName: string; employees: number; allocation: number }>;
}

export type OperationalReportType = 'attendance' | 'leave' | 'resource';

interface OperationalDashboardProps {
  reportType: OperationalReportType;
  timeAttendanceData?: TimeAttendanceData;
  leaveUsageData?: LeaveUsageData;
  resourceAllocationData?: ResourceAllocationData;
}

export default function OperationalDashboard({ 
  reportType, 
  timeAttendanceData,
  leaveUsageData,
  resourceAllocationData
}: OperationalDashboardProps) {
  const { t, locale } = useTranslation();
  
  // Check if current locale is RTL (Arabic)
  const rtlMode = isRTL(locale);

  // State for hidden legend items
  const [hiddenAttendanceStatus, setHiddenAttendanceStatus] = useState<string[]>([]);
  const [hiddenWorkHoursDepts, setHiddenWorkHoursDepts] = useState<string[]>([]);
  const [hiddenAttendanceDays, setHiddenAttendanceDays] = useState<string[]>([]);
  
  const [hiddenLeaveStatus, setHiddenLeaveStatus] = useState<string[]>([]);
  const [hiddenLeaveTypes, setHiddenLeaveTypes] = useState<string[]>([]);
  const [hiddenLeaveDepts, setHiddenLeaveDepts] = useState<string[]>([]);
  const [hiddenLeaveMonths, setHiddenLeaveMonths] = useState<string[]>([]);
  
  const [hiddenDepartments, setHiddenDepartments] = useState<string[]>([]);
  const [hiddenRoles, setHiddenRoles] = useState<string[]>([]);
  const [hiddenProjects, setHiddenProjects] = useState<string[]>([]);

  // Generic function to toggle item visibility
  const toggleItemVisibility = (
    itemKey: string, 
    hiddenItems: string[], 
    setHiddenItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setHiddenItems(prev => {
      if (prev.includes(itemKey)) {
        return prev.filter(item => item !== itemKey);
      } else {
        return [...prev, itemKey];
      }
    });
  };  // Generic custom legend component creator
  const createCustomLegend = (
    items: Array<{id: string; name: string; value: number; hidden?: boolean}>, 
    hiddenItems: string[],
    handleClick: (id: string) => void,
    formatLabel?: (value: number) => string
  ) => {
    // Return a component that is compatible with Recharts Legend content
    return function CustomLegendComponent({ payload }: { payload?: unknown[] }) {
      if (!payload) return null;
      
      return (
        <ul className="recharts-default-legend flex flex-wrap justify-center p-0 m-0">
          {items.map((item, index) => {
            const isHidden = item.hidden || hiddenItems.includes(item.id);
            const displayValue = formatLabel ? formatLabel(item.value) : item.value;
            
            return (
              <li 
                key={`item-${index}`} 
                className="recharts-legend-item legend-item inline-block mr-2.5 cursor-pointer"
                onClick={() => handleClick(item.id)}
              >              
                <span 
                  className={`inline-block px-1 py-0.5 rounded ${
                    isHidden 
                      ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 line-through' 
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span
                    className="recharts-legend-item-icon inline-block w-3.5 h-3.5 mr-1 align-middle"
                    style={{ backgroundColor: COLORS[index % COLORS.length], opacity: isHidden ? 0.3 : 1 }}
                  />
                  <span className="recharts-legend-item-text">
                    {item.name}: {displayValue}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      );
    };
  };
  // Render Time & Attendance Dashboard
  const renderTimeAttendanceDashboard = () => {
    if (!timeAttendanceData) return <div>{t('reports.noDataAvailable')}</div>;    // Prepare data for charts with filtering for hidden items
    const attendanceStatusData = [
      { id: 'onTime', name: t('reports.onTime'), value: timeAttendanceData.onTime },
      { id: 'late', name: t('reports.late'), value: timeAttendanceData.late },
      { id: 'absent', name: t('reports.absent'), value: timeAttendanceData.absent },
      { id: 'earlyDeparture', name: t('reports.earlyDeparture'), value: timeAttendanceData.earlyDeparture }
    ];
    
    // Calculate active total for percentages (only count non-hidden items)
    const activeAttendanceTotal = attendanceStatusData
      .filter(item => !hiddenAttendanceStatus.includes(item.id))
      .reduce((sum, item) => sum + item.value, 0);
      // Format for percentage display
    const formatPercentage = (value: number): string => {
      return `${((value / activeAttendanceTotal) * 100).toFixed(1)}%`;
    };

    // Work hours by department with filtering
    const workHoursByDeptData = Object.entries(timeAttendanceData.workHoursByDepartment)
      .map(([dept, data]) => ({
        id: dept,
        name: dept,
        hours: parseFloat(data.average.toFixed(2)),
        value: parseFloat(data.average.toFixed(2)),
        hidden: hiddenWorkHoursDepts.includes(dept)
      }));    // Attendance by day with filtering
    const attendanceByDayData = Object.entries(timeAttendanceData.attendanceByDay)
      .map(([day, count]) => ({
        id: day,
        name: day,
        count,
        value: count,
        hidden: hiddenAttendanceDays.includes(day)
      }));

    return (
      <div className="space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-blue-500 dark:text-blue-300">{t('reports.totalAttendance')}</h4>
            <p className="text-2xl font-bold">{timeAttendanceData.totalRecords}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-green-500 dark:text-green-300">{t('reports.onTimePercentage')}</h4>
            <p className="text-2xl font-bold">
              {((timeAttendanceData.onTime / timeAttendanceData.totalRecords) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-red-500 dark:text-red-300">{t('reports.latePercentage')}</h4>
            <p className="text-2xl font-bold">{timeAttendanceData.latePercentage.toFixed(1)}%</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-purple-500 dark:text-purple-300">{t('reports.averageWorkHours')}</h4>
            <p className="text-2xl font-bold">{timeAttendanceData.averageWorkHours.toFixed(1)}</p>
          </div>
        </div>        {/* Attendance Status Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.attendanceStatus')}</h3>
          {hiddenAttendanceStatus.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenAttendanceStatus([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceStatusData.filter(item => !hiddenAttendanceStatus.includes(item.id))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {attendanceStatusData
                    .filter(item => !hiddenAttendanceStatus.includes(item.id))
                    .map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatPercentage(value as number), t('reports.attendance')]} 
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    attendanceStatusData, 
                    hiddenAttendanceStatus,
                    (id) => toggleItemVisibility(id, hiddenAttendanceStatus, setHiddenAttendanceStatus),
                    formatPercentage
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Work Hours by Department */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.workHoursByDepartment')}</h3>
          {hiddenWorkHoursDepts.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenWorkHoursDepts([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}
          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workHoursByDeptData.filter(item => !item.hidden)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, t('reports.hours')]}
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    workHoursByDeptData, 
                    hiddenWorkHoursDepts,
                    (id) => toggleItemVisibility(id, hiddenWorkHoursDepts, setHiddenWorkHoursDepts),
                    (value) => `${value} ${t('reports.hours')}`
                  )}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#00C49F" 
                  name={t('reports.averageHours')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance by Day of Week */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.attendanceByDay')}</h3>
          {hiddenAttendanceDays.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenAttendanceDays([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}
          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, t('reports.employees')]}
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    attendanceByDayData, 
                    hiddenAttendanceDays,
                    (id) => toggleItemVisibility(id, hiddenAttendanceDays, setHiddenAttendanceDays),
                    (value) => `${value} ${t('reports.employees')}`
                  )}
                />
                <Bar 
                  dataKey="count" 
                  fill="#0088FE" 
                  name={t('reports.attendanceCount')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  // Render Leave Usage Dashboard
  const renderLeaveUsageDashboard = () => {
    if (!leaveUsageData) return <div>{t('reports.noDataAvailable')}</div>;    // Prepare data for charts with filtering for hidden items
    const leaveStatusData = [
      { id: 'pending', name: t('reports.pending'), value: leaveUsageData?.pendingRequests || 0 },
      { id: 'approved', name: t('reports.approved'), value: leaveUsageData?.approvedRequests || 0 },
      { id: 'rejected', name: t('reports.rejected'), value: leaveUsageData?.rejectedRequests || 0 }
    ];
    
    // Calculate active total for percentages (only count non-hidden items)
    const activeLeaveStatusTotal = leaveStatusData
      .filter(item => !hiddenLeaveStatus.includes(item.id))
      .reduce((sum, item) => sum + item.value, 0);
      
    // Format for percentage display
    const formatLeavePercentage = (value: number): string => {
      return `${((value / activeLeaveStatusTotal) * 100).toFixed(1)}%`;
    };
      // Leave by type with filtering
    const leaveTypeData = Object.entries(leaveUsageData?.leaveByType || {})
      .map(([type, days]) => ({
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize type
        days,
        value: days,
        hidden: hiddenLeaveTypes.includes(type)
      }));

    // Leave by department with filtering
    const leaveByDeptData = Object.entries(leaveUsageData?.leaveByDepartment || {})
      .map(([dept, days]) => ({
        id: dept,
        name: dept,
        days,
        value: days,
        hidden: hiddenLeaveDepts.includes(dept)
      }));    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const leaveByMonthData = (leaveUsageData?.leaveByMonth || [])
      .map((days, index) => ({
        id: monthNames[index],
        name: monthNames[index],
        days,
        value: days,
        hidden: hiddenLeaveMonths.includes(monthNames[index])
      }));
      
    // Event handlers for legend clicks
    const handleLeaveStatusLegendClick = (id: string) => {
      toggleItemVisibility(id, hiddenLeaveStatus, setHiddenLeaveStatus);
    };

    const handleLeaveTypeLegendClick = (id: string) => {
      toggleItemVisibility(id, hiddenLeaveTypes, setHiddenLeaveTypes);
    };

    const handleLeaveDeptLegendClick = (id: string) => {
      toggleItemVisibility(id, hiddenLeaveDepts, setHiddenLeaveDepts);
    };
      const handleLeaveMonthLegendClick = (id: string) => {
      toggleItemVisibility(id, hiddenLeaveMonths, setHiddenLeaveMonths);
    };

    return (
      <div className="space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-blue-500 dark:text-blue-300">{t('reports.totalLeaveRequests')}</h4>            <p className="text-2xl font-bold">{leaveUsageData?.totalLeaveRequests || 0}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-green-500 dark:text-green-300">{t('reports.totalDaysTaken')}</h4>
            <p className="text-2xl font-bold">{leaveUsageData?.totalDaysTaken || 0}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-yellow-500 dark:text-yellow-300">{t('reports.pendingRequests')}</h4>
            <p className="text-2xl font-bold">{leaveUsageData?.pendingRequests || 0}</p>
          </div>
        </div>        {/* Leave Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.leaveStatusDistribution')}</h3>
          {hiddenLeaveStatus.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenLeaveStatus([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveStatusData.filter(item => !hiddenLeaveStatus.includes(item.id))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {leaveStatusData
                    .filter(item => !hiddenLeaveStatus.includes(item.id))
                    .map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie><Tooltip 
                  formatter={(value) => [formatLeavePercentage(value as number), t('reports.requests')]} 
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    leaveStatusData, 
                    hiddenLeaveStatus, 
                    handleLeaveStatusLegendClick,
                    formatLeavePercentage
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave by Type */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.leaveByType')}</h3>
          {hiddenLeaveTypes.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenLeaveTypes([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}
          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />                <Tooltip 
                  formatter={(value) => [value, t('reports.days')]}
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    leaveTypeData, 
                    hiddenLeaveTypes, 
                    handleLeaveTypeLegendClick,
                    (value) => `${value} ${t('reports.days')}`
                  )}
                />
                <Bar 
                  dataKey="days" 
                  fill="#FFBB28" 
                  name={t('reports.days')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave by Month */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.leaveByMonth')}</h3>
          {hiddenLeaveMonths.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenLeaveMonths([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}
          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leaveByMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />                <Tooltip 
                  formatter={(value) => [value, t('reports.days')]}
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    leaveByMonthData, 
                    hiddenLeaveMonths, 
                    handleLeaveMonthLegendClick,
                    (value) => `${value} ${t('reports.days')}`
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="days"
                  stroke="#FF8042"
                  strokeWidth={2}
                  name={t('reports.leaveDays')}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave by Department */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.leaveByDepartment')}</h3>
          {hiddenLeaveDepts.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenLeaveDepts([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}
          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveByDeptData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />                <Tooltip 
                  formatter={(value) => [value, t('reports.days')]}
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    leaveByDeptData, 
                    hiddenLeaveDepts, 
                    handleLeaveDeptLegendClick,
                    (value) => `${value} ${t('reports.days')}`
                  )}
                />
                <Bar dataKey="days" fill="#8884d8" name={t('reports.days')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };  // Render Resource Allocation Dashboard
  const renderResourceAllocationDashboard = () => {
    if (!resourceAllocationData) return <div>{t('reports.noDataAvailable')}</div>;    // Prepare data for charts with filtering for hidden items
    const departmentAllocationData = resourceAllocationData.departmentAllocation
      .map((dept) => ({
        id: dept.department,
        name: dept.department,
        count: dept.count,
        value: dept.count,
        percentage: dept.percentage
      }));

    // Calculate active total for departments (only count non-hidden items)
    const activeDepartmentTotal = departmentAllocationData
      .filter(item => !hiddenDepartments.includes(item.id))
      .reduce((sum, item) => sum + item.count, 0);
    
    // Format for percentage display
    const formatDeptPercentage = (value: number): string => {
      return `${((value / activeDepartmentTotal) * 100).toFixed(1)}%`;
    };    const roleDistributionData = resourceAllocationData.roleDistribution
      .map((role) => ({
        id: role.role,
        name: role.role,
        count: role.count,
        value: role.count,
        percentage: role.percentage
      }));

    // Calculate active total for roles (only count non-hidden items)
    const activeRoleTotal = roleDistributionData
      .filter(item => !hiddenRoles.includes(item.id))
      .reduce((sum, item) => sum + item.count, 0);
    
    // Format for percentage display
    const formatRolePercentage = (value: number): string => {
      return `${((value / activeRoleTotal) * 100).toFixed(1)}%`;
    };    const projectAllocationData = resourceAllocationData.projectAllocation
      .map((project) => ({
        id: project.projectName,
        name: project.projectName,
        employees: project.employees,
        value: project.employees,
        allocation: project.allocation
      }));
      
    // Event handlers for legend clicks
    const handleDepartmentLegendClick = (id: string) => {
      toggleItemVisibility(id, hiddenDepartments, setHiddenDepartments);
    };

    const handleRoleLegendClick = (id: string) => {
      toggleItemVisibility(id, hiddenRoles, setHiddenRoles);
    };    const handleProjectLegendClick = (id: string) => {
      toggleItemVisibility(id, hiddenProjects, setHiddenProjects);
    };

    return (
      <div className="space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-blue-500 dark:text-blue-300">{t('reports.totalEmployees')}</h4>
            <p className="text-2xl font-bold">{resourceAllocationData.totalEmployees}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-green-500 dark:text-green-300">{t('reports.departments')}</h4>
            <p className="text-2xl font-bold">{Object.keys(resourceAllocationData.employeesByDepartment).length}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-purple-500 dark:text-purple-300">{t('reports.roles')}</h4>
            <p className="text-2xl font-bold">{Object.keys(resourceAllocationData.employeesByRole).length}</p>
          </div>
        </div>        {/* Department Allocation */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.departmentAllocation')}</h3>
          {hiddenDepartments.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenDepartments([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}
          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>                <Pie
                  data={departmentAllocationData.filter(item => !hiddenDepartments.includes(item.id))}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                >
                  {departmentAllocationData
                    .filter(item => !hiddenDepartments.includes(item.id))
                    .map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie><Tooltip 
                  formatter={(value) => [`${value} (${formatDeptPercentage(value as number)})`, t('reports.employees')]}
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    departmentAllocationData, 
                    hiddenDepartments, 
                    handleDepartmentLegendClick,
                    formatDeptPercentage
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>        {/* Role Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.roleDistribution')}</h3>
          {hiddenRoles.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenRoles([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}
          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleDistributionData.filter(item => !hiddenRoles.includes(item.id))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis /><Tooltip 
                  formatter={(value) => [`${value} (${formatRolePercentage(value as number)})`, t('reports.employees')]}
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    roleDistributionData, 
                    hiddenRoles, 
                    handleRoleLegendClick,
                    formatRolePercentage
                  )}
                />
                <Bar dataKey="count" fill="#00C49F" name={t('reports.employees')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>        {/* Project Allocation */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">{t('reports.projectAllocation')}</h3>
          {hiddenProjects.length > 0 && (
            <div className="mb-2 text-xs text-gray-500">
              {t('reports.clickLegendToggle')}
              <button 
                onClick={() => setHiddenProjects([])} 
                className="ml-2 text-blue-500 hover:text-blue-700 underline"
              >
                {t('reports.resetFilters')}
              </button>
            </div>
          )}
          <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectAllocationData.filter(item => !hiddenProjects.includes(item.id))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                <YAxis yAxisId="right" orientation="right" stroke="#FFBB28" /><Tooltip 
                  formatter={(value, name) => {
                    if (name === t('reports.employeesAssigned')) return [value, name];
                    return [`${value}%`, name];
                  }}
                  contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                />
                <Legend 
                  content={createCustomLegend(
                    projectAllocationData, 
                    hiddenProjects, 
                    handleProjectLegendClick,
                    (value) => `${value} ${t('reports.employees')}`
                  )}
                />
                <Bar
                  yAxisId="left"
                  dataKey="employees"
                  fill="#0088FE"
                  name={t('reports.employeesAssigned')}
                />
                <Bar
                  yAxisId="right"
                  dataKey="allocation"
                  fill="#FFBB28"
                  name={t('reports.allocationPercentage')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {reportType === 'attendance' && t('reports.timeAttendanceTitle')}
          {reportType === 'leave' && t('reports.leaveUsageTitle')}
          {reportType === 'resource' && t('reports.resourceAllocationTitle')}
        </h2>
      </div>

      {/* Render the appropriate dashboard based on the report type */}
      {reportType === 'attendance' && renderTimeAttendanceDashboard()}
      {reportType === 'leave' && renderLeaveUsageDashboard()}
      {reportType === 'resource' && renderResourceAllocationDashboard()}

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">{t('reports.insightsTitle')}</h3>
        <p className="text-gray-600 dark:text-gray-300">
          {reportType === 'attendance' && t('reports.timeAttendanceInsight')}
          {reportType === 'leave' && t('reports.leaveUsageInsight')}
          {reportType === 'resource' && t('reports.resourceAllocationInsight')}
        </p>
      </div>
    </div>
  );
}
