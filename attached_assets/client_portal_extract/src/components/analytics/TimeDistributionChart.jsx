import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function TimeDistributionChart({ timeEntries, projects, isLoading }) {
  const getProjectName = (id) => projects.find(p => p.id === id)?.title || 'Unassigned';

  const processData = () => {
    if (!timeEntries || timeEntries.length === 0) return [];
    
    const projectTime = timeEntries.reduce((acc, entry) => {
      const projectId = entry.project_id || 'unassigned';
      acc[projectId] = (acc[projectId] || 0) + entry.duration_minutes;
      return acc;
    }, {});

    return Object.entries(projectTime).map(([projectId, minutes]) => ({
      name: getProjectName(projectId),
      value: parseFloat((minutes / 60).toFixed(2)),
    }));
  };

  const data = processData();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">No time data to display.</div>;
  }
  
  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} hours`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}