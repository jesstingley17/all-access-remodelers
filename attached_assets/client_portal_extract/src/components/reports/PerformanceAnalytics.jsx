
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  Target, 
  TrendingUp,
  Users,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { format, subDays, differenceInDays, subMonths, startOfYear } from 'date-fns';

export default function PerformanceAnalytics({ businessData, isLoading }) {
  const performanceMetrics = useMemo(() => {
    if (!businessData.projects || !businessData.projects.length) return {};

    const { projects, tasks, timeEntries, invoices, clients, expenses } = businessData;

    // Productivity metrics
    const totalTimeLogged = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);
    const billableTime = timeEntries.filter(entry => entry.is_billable).reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);
    const timeUtilization = totalTimeLogged > 0 ? (billableTime / totalTimeLogged) * 100 : 0;

    // Project delivery performance
    const completedProjects = projects.filter(p => p.status === 'completed');
    const onTimeProjects = completedProjects.filter(p => {
      if (!p.due_date || !p.completion_date) return false;
      return new Date(p.completion_date) <= new Date(p.due_date);
    });
    const onTimeDeliveryRate = completedProjects.length > 0 ? (onTimeProjects.length / completedProjects.length) * 100 : 0;

    // Scope changes
    const projectsWithScopeChanges = projects.filter(p => 
      p.actual_hours && p.estimated_hours && (p.actual_hours / p.estimated_hours) > 1.2
    );
    const scopeChangeRate = projects.length > 0 ? (projectsWithScopeChanges.length / projects.length) * 100 : 0;

    // Client metrics
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
    const clientLifetimeValue = clients.length > 0 ? totalRevenue / clients.length : 0;
    
    // Client Acquisition Cost
    const marketingExpenses = expenses
        .filter(e => e.category === 'marketing' && new Date(e.date) >= subMonths(new Date(), 12))
        .reduce((sum, e) => sum + e.amount, 0);
    const newClientsLastYear = clients.filter(c => new Date(c.created_date) >= subMonths(new Date(), 12)).length;
    const clientAcquisitionCost = newClientsLastYear > 0 ? marketingExpenses / newClientsLastYear : 0;


    // Revenue per hour
    const revenuePerHour = billableTime > 0 ? totalRevenue / billableTime : 0;

    // Time estimation accuracy
    const projectsWithEstimates = projects.filter(p => p.estimated_hours && p.actual_hours);
    const estimationAccuracy = projectsWithEstimates.length > 0 
      ? projectsWithEstimates.reduce((sum, p) => {
          const accuracy = 100 - Math.abs((p.actual_hours - p.estimated_hours) / p.estimated_hours) * 100;
          return sum + Math.max(accuracy, 0);
        }, 0) / projectsWithEstimates.length
      : 0;

    return {
      timeUtilization,
      onTimeDeliveryRate,
      scopeChangeRate,
      clientLifetimeValue,
      clientAcquisitionCost,
      revenuePerHour,
      estimationAccuracy,
      totalBillableHours: billableTime,
      totalRevenue
    };
  }, [businessData]);

  const productivityTrend = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayEntries = businessData.timeEntries.filter(entry => 
        format(new Date(entry.start_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);
      const billableHours = dayEntries.filter(entry => entry.is_billable).reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);
      
      return {
        date: format(date, 'MMM dd'),
        totalHours: totalHours,
        billableHours: billableHours,
        utilization: totalHours > 0 ? (billableHours / totalHours) * 100 : 0
      };
    });
    
    return last30Days;
  }, [businessData.timeEntries]);

  const clientAcquisitionData = useMemo(() => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i); // Corrected to subMonths
      const monthClients = businessData.clients.filter(client => {
        const clientDate = new Date(client.created_date);
        return format(clientDate, 'yyyy-MM') === format(date, 'yyyy-MM');
      }).length;
      
      const monthRevenue = businessData.invoices.filter(inv => {
        const invDate = new Date(inv.issue_date);
        return format(invDate, 'yyyy-MM') === format(date, 'yyyy-MM') && inv.status === 'paid';
      }).reduce((sum, inv) => sum + inv.total_amount, 0);
      
      return {
        month: format(date, 'MMM yyyy'),
        newClients: monthClients,
        revenue: monthRevenue,
        avgClientValue: monthClients > 0 ? monthRevenue / monthClients : 0
      };
    }).reverse();
    
    return last12Months;
  }, [businessData.clients, businessData.invoices]);

  const efficiencyMetrics = useMemo(() => {
    const projectTypes = {};
    
    businessData.projects.forEach(project => {
      if (!projectTypes[project.project_type]) {
        projectTypes[project.project_type] = {
          totalProjects: 0,
          totalHours: 0,
          totalRevenue: 0,
          avgDeliveryTime: 0
        };
      }
      
      projectTypes[project.project_type].totalProjects++;
      if (project.actual_hours) {
        projectTypes[project.project_type].totalHours += project.actual_hours;
      }
      
      // Calculate revenue for this project
      const projectInvoices = businessData.invoices.filter(inv => inv.project_id === project.id && inv.status === 'paid');
      const projectRevenue = projectInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      projectTypes[project.project_type].totalRevenue += projectRevenue;
      
      // Calculate delivery time
      if (project.start_date && project.completion_date) {
        const deliveryDays = differenceInDays(new Date(project.completion_date), new Date(project.start_date));
        projectTypes[project.project_type].avgDeliveryTime += deliveryDays;
      }
    });
    
    return Object.entries(projectTypes).map(([type, data]) => ({
      type: type.replace('_', ' ').toUpperCase(),
      avgHoursPerProject: data.totalProjects > 0 ? data.totalHours / data.totalProjects : 0,
      revenuePerHour: data.totalHours > 0 ? data.totalRevenue / data.totalHours : 0,
      avgDeliveryDays: data.totalProjects > 0 ? data.avgDeliveryTime / data.totalProjects : 0,
      totalProjects: data.totalProjects
    }));
  }, [businessData.projects, businessData.invoices]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Time Utilization</p>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {performanceMetrics.timeUtilization?.toFixed(1)}%
                </div>
                <Badge className={`mt-2 ${performanceMetrics.timeUtilization >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {performanceMetrics.timeUtilization >= 75 ? 'Excellent' : 'Improving'}
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">On-Time Delivery</p>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {performanceMetrics.onTimeDeliveryRate?.toFixed(1)}%
                </div>
                <Badge className={`mt-2 ${performanceMetrics.onTimeDeliveryRate >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {performanceMetrics.onTimeDeliveryRate >= 90 ? 'Excellent' : 'Needs Focus'}
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Revenue/Hour</p>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  ${performanceMetrics.revenuePerHour?.toFixed(0)}
                </div>
                <Badge className="mt-2 bg-purple-100 text-purple-800">
                  Effective Rate
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Estimate Accuracy</p>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {performanceMetrics.estimationAccuracy?.toFixed(1)}%
                </div>
                <Badge className={`mt-2 ${performanceMetrics.estimationAccuracy >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {performanceMetrics.estimationAccuracy >= 80 ? 'Great' : 'Improving'}
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-amber-100">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Client Acq. Cost</p>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  ${performanceMetrics.clientAcquisitionCost?.toFixed(0)}
                </div>
                <Badge className="mt-2 bg-pink-100 text-pink-800">
                  Last 12 Months
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-pink-100">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Client LTV</p>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  ${performanceMetrics.clientLifetimeValue?.toFixed(0)}
                </div>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  Average LTV
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5" />
              Productivity Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'utilization' ? `${value.toFixed(1)}%` : `${value.toFixed(1)}h`,
                      name === 'utilization' ? 'Utilization' : name === 'billableHours' ? 'Billable Hours' : 'Total Hours'
                    ]}
                  />
                  <Area type="monotone" dataKey="totalHours" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="billableHours" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Line type="monotone" dataKey="utilization" stroke="#ef4444" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Client Acquisition Cost & LTV */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Users className="w-5 h-5" />
              Client Acquisition & Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientAcquisitionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'avgClientValue' ? `$${value.toFixed(0)}` : value,
                      name === 'avgClientValue' ? 'Avg Client Value' : name === 'newClients' ? 'New Clients' : 'Revenue'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="newClients" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="avgClientValue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Type Efficiency */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Award className="w-5 h-5" />
            Service Type Efficiency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-semibold text-slate-700">Service Type</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Avg Hours/Project</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Revenue/Hour</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Avg Delivery Days</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Total Projects</th>
                </tr>
              </thead>
              <tbody>
                {efficiencyMetrics.map((metric, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{metric.type}</td>
                    <td className="p-3 text-right text-slate-700">{metric.avgHoursPerProject.toFixed(1)}h</td>
                    <td className="p-3 text-right">
                      <span className={`font-semibold ${metric.revenuePerHour >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        ${metric.revenuePerHour.toFixed(0)}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-700">{metric.avgDeliveryDays.toFixed(0)} days</td>
                    <td className="p-3 text-right">
                      <Badge variant="outline">{metric.totalProjects}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Recommendations */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <AlertTriangle className="w-5 h-5" />
            Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {performanceMetrics.timeUtilization < 75 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900">Improve Time Utilization</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Your billable time utilization is {performanceMetrics.timeUtilization.toFixed(1)}%. 
                      Consider reducing non-billable activities or increasing rates.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {performanceMetrics.onTimeDeliveryRate < 90 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Focus on Delivery Times</h4>
                    <p className="text-sm text-red-700 mt-1">
                      {performanceMetrics.onTimeDeliveryRate.toFixed(1)}% on-time delivery rate. 
                      Consider better project planning and buffer time.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {performanceMetrics.scopeChangeRate > 30 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900">Reduce Scope Creep</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      High scope change rate ({performanceMetrics.scopeChangeRate.toFixed(1)}%) detected. Consider more detailed contracts and change order processes.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {performanceMetrics.revenuePerHour < 75 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Optimize Pricing</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Revenue per hour is ${performanceMetrics.revenuePerHour.toFixed(0)}. 
                      Consider raising rates or focusing on higher-value services.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
