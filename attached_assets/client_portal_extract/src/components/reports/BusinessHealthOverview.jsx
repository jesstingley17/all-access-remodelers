
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  DollarSign,
  FolderOpen,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const statusIcons = {
  excellent: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  good: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' }
};

export default function BusinessHealthOverview({ kpiMetrics, businessData, isLoading }) {
  const calculatedKPIs = useMemo(() => {
    // Add safety check for businessData and its properties
    if (isLoading || !businessData || !businessData.projects) return [];

    // Destructure with default empty arrays to prevent errors if properties are missing
    const { projects = [], tasks = [], timeEntries = [], invoices = [], clients = [] } = businessData;
    const now = new Date();
    const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    const lastMonth = { start: startOfMonth(subDays(now, 30)), end: endOfMonth(subDays(now, 30)) };

    // Revenue calculations with safety checks for invoice objects and properties
    const thisMonthRevenue = invoices
      .filter(inv => {
        try {
          return inv && inv.issue_date && 
                 new Date(inv.issue_date) >= thisMonth.start && 
                 new Date(inv.issue_date) <= thisMonth.end && 
                 inv.status === 'paid';
        } catch (e) {
          // Log error or handle invalid date gracefully
          // console.error("Error parsing issue_date for invoice:", inv, e);
          return false;
        }
      })
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0); // Use (inv.total_amount || 0) for robustness

    const lastMonthRevenue = invoices
      .filter(inv => {
        try {
          return inv && inv.issue_date && 
                 new Date(inv.issue_date) >= lastMonth.start && 
                 new Date(inv.issue_date) <= lastMonth.end && 
                 inv.status === 'paid';
        } catch (e) {
          // Log error or handle invalid date gracefully
          // console.error("Error parsing issue_date for invoice:", inv, e);
          return false;
        }
      })
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    // Active projects with safety check for project objects and status
    const activeProjects = projects.filter(p => p && p.status === 'active').length;
    
    // Billable utilization with safety checks for timeEntry objects and properties
    const totalHours = timeEntries.reduce((sum, entry) => sum + ((entry && entry.duration_minutes || 0) / 60), 0);
    const billableHours = timeEntries.filter(entry => entry && entry.is_billable).reduce((sum, entry) => sum + ((entry && entry.duration_minutes || 0) / 60), 0);
    const billableUtilization = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    // Overdue invoices with safety checks
    const overdueInvoices = invoices.filter(inv => {
      try {
        return inv && inv.due_date && new Date(inv.due_date) < now && inv.status !== 'paid';
      } catch (e) {
        // Log error or handle invalid date gracefully
        // console.error("Error parsing due_date for invoice:", inv, e);
        return false;
      }
    }).length;

    // Client satisfaction (mock calculation based on project completion) - kept as original
    const completedProjects = projects.filter(p => p && p.status === 'completed');
    const avgClientSatisfaction = completedProjects.length > 0 
      ? (completedProjects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / completedProjects.length) / 10
      : 8.5;

    return [
      {
        name: 'Monthly Revenue',
        current_value: thisMonthRevenue,
        previous_value: lastMonthRevenue,
        target_value: 15000,
        unit: 'currency',
        status: thisMonthRevenue >= 15000 ? 'excellent' : thisMonthRevenue >= 10000 ? 'good' : 'warning',
        trend: thisMonthRevenue > lastMonthRevenue ? 'up' : thisMonthRevenue < lastMonthRevenue ? 'down' : 'stable'
      },
      {
        name: 'Active Projects',
        current_value: activeProjects,
        previous_value: activeProjects, // Would need historical data, but for now, previous_value is current
        target_value: 8,
        unit: 'count',
        status: activeProjects >= 8 ? 'excellent' : activeProjects >= 5 ? 'good' : 'warning',
        trend: 'stable'
      },
      {
        name: 'Billable Utilization',
        current_value: billableUtilization,
        previous_value: billableUtilization, // Would need historical data, but for now, previous_value is current
        target_value: 75,
        unit: 'percentage',
        status: billableUtilization >= 75 ? 'excellent' : billableUtilization >= 60 ? 'good' : 'warning',
        trend: 'stable'
      },
      {
        name: 'Overdue Invoices',
        current_value: overdueInvoices,
        previous_value: overdueInvoices, // Would need historical data, but for now, previous_value is current
        target_value: 0,
        unit: 'count',
        status: overdueInvoices === 0 ? 'excellent' : overdueInvoices <= 2 ? 'good' : 'warning',
        trend: 'stable'
      }
    ];
  }, [businessData, isLoading]); // Dependency array includes businessData and isLoading

  const revenueData = useMemo(() => {
    // Add safety check for businessData and invoices
    if (!businessData || !businessData.invoices || !businessData.invoices.length) return [];
    
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    return last30Days.map(date => {
      const dayRevenue = businessData.invoices
        .filter(inv => {
          try {
            return inv && inv.issue_date &&
                   format(new Date(inv.issue_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && 
                   inv.status === 'paid';
          } catch (e) {
            // Log error or handle invalid date gracefully
            // console.error("Error parsing issue_date for revenue chart:", inv, e);
            return false;
          }
        })
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      return {
        date: format(date, 'MMM dd'),
        revenue: dayRevenue
      };
    });
  }, [businessData]); // Dependency array includes businessData

  const projectStatusData = useMemo(() => {
    // Add safety check for businessData and projects
    if (!businessData || !businessData.projects || !businessData.projects.length) return [];
    
    const statusCounts = businessData.projects.reduce((acc, project) => {
      // Add safety check for project object and its status property
      if (project && project.status) {
        acc[project.status] = (acc[project.status] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count
    }));
  }, [businessData]); // Dependency array includes businessData

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Add safety check for empty businessData when not loading
  if (!businessData || Object.keys(businessData).length === 0 || 
      (!businessData.projects?.length && !businessData.invoices?.length && !businessData.timeEntries?.length)) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No data available</h3>
        <p className="text-slate-500">Start by creating projects, tasks, and tracking time to see your business health overview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {calculatedKPIs.map((kpi, index) => {
          // Fallback to 'warning' status config if kpi.status is undefined or not found
          const statusConfig = statusIcons[kpi.status] || statusIcons.warning;
          const StatusIcon = statusConfig.icon;
          const trendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
          const TrendIcon = trendIcon;

          const formatValue = (value, unit) => {
            if (typeof value !== 'number') return '0'; // Ensure value is a number before formatting
            switch (unit) {
              case 'currency':
                return `$${value.toLocaleString()}`;
              case 'percentage':
                return `${value.toFixed(1)}%`;
              case 'count':
                return value.toString();
              default:
                return value.toString();
            }
          };

          const changePercent = kpi.previous_value > 0 
            ? ((kpi.current_value - kpi.previous_value) / kpi.previous_value) * 100 
            : 0; // Handle division by zero

          return (
            <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${statusConfig.bg} rounded-full opacity-10`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                      {kpi.name}
                    </p>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight mt-2">
                      {formatValue(kpi.current_value, kpi.unit)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${statusConfig.bg}`}>
                    <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`w-4 h-4 ${
                      kpi.trend === 'up' ? 'text-emerald-500' : 
                      kpi.trend === 'down' ? 'text-red-500' : 'text-slate-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-emerald-600' : 
                      kpi.trend === 'down' ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {Math.abs(changePercent).toFixed(1)}%
                    </span>
                  </div>
                  <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0`}>
                    {kpi.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <DollarSign className="w-5 h-5" />
              Revenue Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? ( // Conditionally render chart or placeholder
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: '#64748b' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} // Format tooltip value
                      labelStyle={{ color: '#1e293b' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No revenue data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FolderOpen className="w-5 h-5" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectStatusData.length > 0 ? ( // Conditionally render chart or placeholder
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <FolderOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No project data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Summary */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TrendingUp className="w-5 h-5" />
            Monthly Cash Flow Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-900 mb-2">
                {/* Add safety check for businessData.invoices and its properties */}
                ${(businessData.invoices || []).filter(inv => inv && inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                Total Revenue
              </div>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {/* Add safety check for businessData.invoices and its properties */}
                ${(businessData.invoices || []).filter(inv => inv && inv.status !== 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Outstanding
              </div>
            </div>
            
            <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-3xl font-bold text-amber-900 mb-2">
                {/* Add safety check for businessData.invoices and date parsing */}
                {(businessData.invoices || []).filter(inv => {
                  try {
                    return inv && inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid';
                  } catch (e) {
                    // console.error("Error parsing due_date for cash flow summary:", inv, e);
                    return false;
                  }
                }).length}
              </div>
              <div className="text-sm font-semibold text-amber-700 uppercase tracking-wider">
                Overdue Invoices
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
