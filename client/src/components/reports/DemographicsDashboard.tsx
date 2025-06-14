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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function DemographicsDashboard({ data }: DemographicsDataProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('department');

  // Format department data for charts
  const departmentData = data.departmentDistribution.map(dept => ({
    name: dept._id,
    value: dept.count
  }));

  // Format role data for charts
  const roleData = data.roleDistribution.map(role => ({
    name: role._id.charAt(0).toUpperCase() + role._id.slice(1), // Capitalize the role name
    value: role.count
  }));

  // Format age data for charts
  const ageData = data.ageDistribution;

  // Format tenure data for charts
  const tenureData = data.tenureDistribution;

  // Generate percentage values
  const getPercentage = (count: number): string => {
    return ((count / data.totalEmployees) * 100).toFixed(1) + '%';
  };

  // Type-safe formatter for charts
  const formatTooltip = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    return `${numValue} (${getPercentage(numValue)})`;
  };

  // Custom label renderer for pie charts
  const renderCustomLabel = (entry: { name: string; value: number }): string => {
    return `${entry.name}: ${getPercentage(entry.value)}`;
  };

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
            <h3 className="text-xl font-semibold mb-4">{t('reports.departmentPercentage')}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={renderCustomLabel}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number), t('reports.employees')]} 
                />
                <Legend />
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
          <div className="h-80">
            <h3 className="text-xl font-semibold mb-4">{t('reports.rolePercentage')}</h3>
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
                  label={renderCustomLabel}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number), t('reports.employees')]} 
                />
                <Legend />
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
          <div className="h-80">
            <h3 className="text-xl font-semibold mb-4">{t('reports.agePercentage')}</h3>
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
                  label={renderCustomLabel}
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number), t('reports.employees')]} 
                />
                <Legend />
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
          <div className="h-80">
            <h3 className="text-xl font-semibold mb-4">{t('reports.tenurePercentage')}</h3>
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
                  label={renderCustomLabel}
                >
                  {tenureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatTooltip(value as number), t('reports.employees')]} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">{t('reports.insightsTitle')}</h3>
        <p className="text-gray-600 dark:text-gray-300">
          {t('reports.insightsDescription')}
        </p>
      </div>
    </div>
  );
}
