'use client';

import { useTranslation } from '@/contexts/I18nContext';
import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface DemographicsDataProps {
  data: {
    totalEmployees: number;
    departmentDistribution: {
      _id: string;
      count: number;
    }[];
    roleDistribution: {
      _id: string;
      count: number;
    }[];
    ageDistribution: {
      range: string;
      count: number;
    }[];
    tenureDistribution: {
      range: string;
      count: number;
    }[];
    genderDistribution: {
      male: number;
      female: number;
      other: number;
      notSpecified: number;
    };  };
}

interface ChartPayloadItem {
  value: number;
  name: string;
  color: string;
  dataKey: string;
  payload: {
    name: string;
    value: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function DemographicsDashboard({ data }: DemographicsDataProps) {  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('department');
  const [hiddenDepartments, setHiddenDepartments] = useState<string[]>([]);
  const [hiddenRoles, setHiddenRoles] = useState<string[]>([]);
  const [hiddenAgeRanges, setHiddenAgeRanges] = useState<string[]>([]);
  const [hiddenTenureRanges, setHiddenTenureRanges] = useState<string[]>([]);

  // Format department data for charts with hidden state
  const departmentData = data.departmentDistribution
    .map(dept => ({
      name: dept._id,
      value: dept.count,
      hidden: hiddenDepartments.includes(dept._id)
    }))
    .filter(item => !item.hidden);

  // Calculate active employee count for departments (excluding hidden items)
  const activeDepartmentEmployeeCount = departmentData.reduce((sum, item) => sum + item.value, 0);

  // Format role data for charts with hidden state
  const roleData = data.roleDistribution
    .map(role => ({
      name: role._id.charAt(0).toUpperCase() + role._id.slice(1), // Capitalize the role name
      value: role.count,
      hidden: hiddenRoles.includes(role._id)
    }))
    .filter(item => !item.hidden);

  // Calculate active employee count for roles (excluding hidden items)
  const activeRoleEmployeeCount = roleData.reduce((sum, item) => sum + item.value, 0);

  // Format age data for charts with hidden state
  const ageData = data.ageDistribution
    .map(age => ({
      ...age,
      hidden: hiddenAgeRanges.includes(age.range)
    }))
    .filter(item => !item.hidden);

  // Calculate active employee count for age ranges (excluding hidden items)
  const activeAgeEmployeeCount = ageData.reduce((sum, item) => sum + item.count, 0);

  // Format tenure data for charts with hidden state
  const tenureData = data.tenureDistribution
    .map(tenure => ({
      ...tenure,
      hidden: hiddenTenureRanges.includes(tenure.range)
    }))
    .filter(item => !item.hidden);
    
  // Calculate active employee count for tenure ranges (excluding hidden items)
  const activeTenureEmployeeCount = tenureData.reduce((sum, item) => sum + item.count, 0);
  // Generate percentage values based on visible employees
  const getPercentage = (count: number, total: number = data.totalEmployees): string => {
    return ((count / total) * 100).toFixed(1) + '%';
  };

  // Get the appropriate active count based on chart type
  const getActiveCount = (chartType: 'department' | 'role' | 'age' | 'tenure'): number => {
    switch (chartType) {
      case 'department': return activeDepartmentEmployeeCount;
      case 'role': return activeRoleEmployeeCount;
      case 'age': return activeAgeEmployeeCount;
      case 'tenure': return activeTenureEmployeeCount;
      default: return data.totalEmployees;
    }
  };

  // Type-safe formatter for charts
  const formatTooltip = (value: number | string, chartType?: 'department' | 'role' | 'age' | 'tenure'): string => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    const total = chartType ? getActiveCount(chartType) : data.totalEmployees;
    return `${numValue} (${getPercentage(numValue, total)})`;
  };

  // Custom label renderer for pie charts
  const renderCustomLabel = (entry: { name: string; value: number }, chartType?: 'department' | 'role' | 'age' | 'tenure'): string => {
    const total = chartType ? getActiveCount(chartType) : data.totalEmployees;
    return `${entry.name}: ${getPercentage(entry.value, total)}`;
  };

  // Handler for legend item clicks - generic for all chart types
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
  };

  // Handlers for each chart type
  const handleDepartmentLegendClick = (dept: string) => {
    toggleItemVisibility(dept, hiddenDepartments, setHiddenDepartments);
  };
  
  const handleRoleLegendClick = (role: string) => {
    toggleItemVisibility(role, hiddenRoles, setHiddenRoles);
  };
  
  const handleAgeLegendClick = (ageRange: string) => {
    toggleItemVisibility(ageRange, hiddenAgeRanges, setHiddenAgeRanges);
  };
  
  const handleTenureLegendClick = (tenureRange: string) => {
    toggleItemVisibility(tenureRange, hiddenTenureRanges, setHiddenTenureRanges);
  };
  // Note: We're accepting the inline style warning for now, as it's needed 
  // to dynamically apply the chart colors from the COLORS array  // Generic legend renderer component for all chart types
  const createCustomLegend = (
    items: Array<{id: string; name: string; value: number}>, 
    hiddenItems: string[],
    handleClick: (id: string) => void
  ) => {
    const CustomLegendComponent = ({ payload }: { payload?: ChartPayloadItem[] }) => {
      if (!payload) return null;
      
      return (
       <ul className="recharts-default-legend flex flex-wrap justify-center p-0 m-0">
  {items.map((item, index) => {
    const isHidden = hiddenItems.includes(item.id);
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
          {/* Note: We need to use inline style here for dynamic color assignment from the color array */}
          <span
            className="recharts-legend-item-icon inline-block w-3.5 h-3.5 mr-1 align-middle"
            style={{ backgroundColor: COLORS[index % COLORS.length], opacity: isHidden ? 0.3 : 1 }}
          />
          <span className="recharts-legend-item-text">
            {item.name}: {getPercentage(item.value)}
          </span>
        </span>
      </li>
    );
  })}
</ul>
      );
    };
    
    return CustomLegendComponent;
  };

  // Create legend components for each chart type
  const DepartmentLegend = createCustomLegend(
    data.departmentDistribution.map(dept => ({ id: dept._id, name: dept._id, value: dept.count })),
    hiddenDepartments,
    handleDepartmentLegendClick
  );
  
  const RoleLegend = createCustomLegend(
    data.roleDistribution.map(role => ({ 
      id: role._id, 
      name: role._id.charAt(0).toUpperCase() + role._id.slice(1), 
      value: role.count 
    })),
    hiddenRoles,
    handleRoleLegendClick
  );
  
  const AgeLegend = createCustomLegend(
    data.ageDistribution.map(age => ({ id: age.range, name: age.range, value: age.count })),
    hiddenAgeRanges,
    handleAgeLegendClick
  );
  
  const TenureLegend = createCustomLegend(
    data.tenureDistribution.map(tenure => ({ id: tenure.range, name: tenure.range, value: tenure.count })),
    hiddenTenureRanges,
    handleTenureLegendClick
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('reports.employeeDemographics')}</h2>
        <div className="text-sm bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
          {t('reports.totalEmployees')}: <span className="font-bold">{data.totalEmployees}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'department' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('department')}
        >
          {t('reports.byDepartment')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'role' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('role')}
        >
          {t('reports.byRole')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'age' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('age')}
        >
          {t('reports.byAge')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'tenure' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tenure')}
        >
          {t('reports.byTenure')}
        </button>
      </div>

      {/* Department Distribution */}
      {activeTab === 'department' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <h3 className="text-xl font-semibold mb-4">{t('reports.departmentDistribution')}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number), t('reports.employees')]} 
                />
                <Legend />
                <Bar dataKey="value" name={t('reports.employees')} fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80">
            <h3 className="text-xl font-semibold mb-4">{t('reports.departmentPercentage')}</h3>            {hiddenDepartments.length > 0 && (
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => renderCustomLabel(entry, 'department')}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number, 'department'), t('reports.employees')]} 
                />
                <Legend content={<DepartmentLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Role Distribution */}
      {activeTab === 'role' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <h3 className="text-xl font-semibold mb-4">{t('reports.roleDistribution')}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roleData}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number), t('reports.employees')]} 
                />
                <Legend />
                <Bar dataKey="value" name={t('reports.employees')} fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80">            <h3 className="text-xl font-semibold mb-4">{t('reports.rolePercentage')}</h3>
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => renderCustomLabel(entry, 'role')}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number, 'role'), t('reports.employees')]} 
                />
                <Legend content={<RoleLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Age Distribution */}
      {activeTab === 'age' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <h3 className="text-xl font-semibold mb-4">{t('reports.ageDistribution')}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageData}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number), t('reports.employees')]} 
                />
                <Legend />
                <Bar dataKey="count" name={t('reports.employees')} fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80">            <h3 className="text-xl font-semibold mb-4">{t('reports.agePercentage')}</h3>
            {hiddenAgeRanges.length > 0 && (
              <div className="mb-2 text-xs text-gray-500">
                {t('reports.clickLegendToggle')}
                <button 
                  onClick={() => setHiddenAgeRanges([])} 
                  className="ml-2 text-blue-500 hover:text-blue-700 underline"
                >
                  {t('reports.resetFilters')}
                </button>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => renderCustomLabel(entry, 'age')}
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number, 'age'), t('reports.employees')]} 
                />
                <Legend content={<AgeLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tenure Distribution */}
      {activeTab === 'tenure' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <h3 className="text-xl font-semibold mb-4">{t('reports.tenureDistribution')}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tenureData}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number), t('reports.employees')]} 
                />
                <Legend />
                <Bar dataKey="count" name={t('reports.employees')} fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80">            <h3 className="text-xl font-semibold mb-4">{t('reports.tenurePercentage')}</h3>
            {hiddenTenureRanges.length > 0 && (
              <div className="mb-2 text-xs text-gray-500">
                {t('reports.clickLegendToggle')}
                <button 
                  onClick={() => setHiddenTenureRanges([])} 
                  className="ml-2 text-blue-500 hover:text-blue-700 underline"
                >
                  {t('reports.resetFilters')}
                </button>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tenureData}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => renderCustomLabel(entry, 'tenure')}
                >
                  {tenureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number, 'tenure'), t('reports.employees')]} 
                />
                <Legend content={<TenureLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-16 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">{t('reports.insightsTitle')}</h3>
        <p className="text-gray-600 dark:text-gray-300">
          {t('reports.insightsDescription')}
        </p>
      </div>
    </div>
  );
}
