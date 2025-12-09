import React, { useState, useEffect } from 'react';
import { Report } from '@/api/entities';
import { Project } from '@/api/entities';
import { Task } from '@/api/entities';
import { TimeEntry } from '@/api/entities';
import { Invoice } from '@/api/entities';
import { Client } from '@/api/entities';
import { Expense } from '@/api/entities';
import { BusinessGoal } from '@/api/entities';
import { KPIMetric } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  Download,
  Calendar,
  Filter
} from "lucide-react";

import BusinessHealthOverview from "../components/reports/BusinessHealthOverview";
import CustomReportBuilder from "../components/reports/CustomReportBuilder";
import PerformanceAnalytics from "../components/reports/PerformanceAnalytics";
import GoalTracking from "../components/reports/GoalTracking";
import ReportLibrary from "../components/reports/ReportLibrary";

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState([]);
  const [goals, setGoals] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState([]);
  const [businessData, setBusinessData] = useState({
    projects: [],
    tasks: [],
    timeEntries: [],
    invoices: [],
    clients: [],
    expenses: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        reportsData,
        goalsData,
        kpiData,
        projectsData,
        tasksData,
        timeEntriesData,
        invoicesData,
        clientsData,
        expensesData
      ] = await Promise.all([
        Report.list("-updated_date"),
        BusinessGoal.list("-updated_date"),
        KPIMetric.list("display_order"),
        Project.list("-updated_date"),
        Task.list("-updated_date"),
        TimeEntry.list("-start_time"),
        Invoice.list("-issue_date"),
        Client.list("-updated_date"),
        Expense.list("-date")
      ]);

      setReports(reportsData || []);
      setGoals(goalsData || []);
      setKpiMetrics(kpiData || []);
      setBusinessData({
        projects: projectsData || [],
        tasks: tasksData || [],
        timeEntries: timeEntriesData || [],
        invoices: invoicesData || [],
        clients: clientsData || [],
        expenses: expensesData || []
      });
    } catch (error) {
      console.error("Error loading reports data:", error);
      setReports([]);
      setGoals([]);
      setKpiMetrics([]);
      setBusinessData({
        projects: [],
        tasks: [],
        timeEntries: [],
        invoices: [],
        clients: [],
        expenses: []
      });
    }
    setIsLoading(false);
  };

  const handleCreateReport = () => {
    setActiveTab('builder');
  };

  const handleReportSave = (reportData) => {
    loadData();
    setActiveTab('library');
  };

  const handleGoalUpdate = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-600 mt-1 font-medium">Business intelligence and performance insights</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={handleCreateReport} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Business Health
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goal Tracking
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Report Builder
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Report Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <BusinessHealthOverview 
              kpiMetrics={kpiMetrics}
              businessData={businessData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceAnalytics 
              businessData={businessData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <GoalTracking 
              goals={goals}
              businessData={businessData}
              onGoalUpdate={handleGoalUpdate}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="builder" className="mt-6">
            <CustomReportBuilder 
              businessData={businessData}
              onSave={handleReportSave}
            />
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <ReportLibrary 
              reports={reports}
              onReportUpdate={loadData}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}