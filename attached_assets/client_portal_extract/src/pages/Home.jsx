import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  CheckSquare,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileText,
  BarChart2
} from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [businessMode, setBusinessMode] = useState('construction');
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0 },
    tasks: { total: 0, dueToday: 0, overdue: 0 },
    clients: { total: 0, active: 0 },
    events: { today: 0, thisWeek: 0 },
    revenue: { total: 0, pending: 0 },
    hoursThisWeek: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setBusinessMode(user.business_mode || 'construction');
        loadData(user);
      } catch (e) {
        setCurrentUser(null);
        setIsLoading(false);
        window.location.href = '/Landing';
      }
    };
    initialize();
  }, []);

  const loadData = async (user) => {
    setIsLoading(true);
    try {
      const userFilter = { created_by: user.email };
      
      if (user.business_mode === 'cleaning') {
        const [jobs, clients, events] = await Promise.all([
          base44.entities.CleaningJob.filter(userFilter).catch(() => []),
          base44.entities.CleaningClient.filter(userFilter).catch(() => []),
          base44.entities.Event.filter(userFilter).catch(() => [])
        ]);

        const today = new Date().toDateString();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

        setStats({
          projects: { total: jobs.length, active: jobs.filter(j => j.status === 'scheduled' || j.status === 'in_progress').length },
          tasks: { total: 0, dueToday: 0, overdue: 0 },
          clients: { total: clients.length, active: clients.filter(c => c.status === 'active').length },
          events: { 
            today: events.filter(e => new Date(e.start_time).toDateString() === today).length,
            thisWeek: events.filter(e => new Date(e.start_time) <= oneWeekFromNow).length
          },
          revenue: { total: 0, pending: 0 },
          hoursThisWeek: 0
        });

        setRecentActivity([
          ...jobs.slice(0, 3).map(j => ({ type: 'job', item: j })),
          ...clients.slice(0, 2).map(c => ({ type: 'client', item: c }))
        ]);
      } else {
        const [projects, tasks, clients, events, invoices, timeEntries] = await Promise.all([
          base44.entities.Project.filter(userFilter).catch(() => []),
          base44.entities.Task.filter(userFilter).catch(() => []),
          base44.entities.Client.filter(userFilter).catch(() => []),
          base44.entities.Event.filter(userFilter).catch(() => []),
          base44.entities.Invoice.filter(userFilter).catch(() => []),
          base44.entities.TimeEntry.filter(userFilter).catch(() => [])
        ]);

        const today = new Date().toDateString();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

        const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');

        setStats({
          projects: { total: projects.length, active: projects.filter(p => p.status === 'active').length },
          tasks: { 
            total: tasks.length, 
            dueToday: tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === today && t.status !== 'completed').length,
            overdue: overdueTasks.length
          },
          clients: { total: clients.length, active: clients.length },
          events: { 
            today: events.filter(e => new Date(e.start_time).toDateString() === today).length,
            thisWeek: events.filter(e => new Date(e.start_time) <= oneWeekFromNow).length
          },
          revenue: { 
            total: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
            pending: invoices.filter(i => i.status === 'sent').reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
          },
          hoursThisWeek: (timeEntries.filter(t => new Date(t.created_date) >= oneWeekAgo).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60).toFixed(1)
        });

        setRecentActivity([
          ...projects.slice(0, 2).map(p => ({ type: 'project', item: p })),
          ...tasks.slice(0, 2).map(t => ({ type: 'task', item: t })),
          ...clients.slice(0, 1).map(c => ({ type: 'client', item: c }))
        ]);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading overview...</p>
      </div>
    );
  }

  const quickActions = businessMode === 'cleaning' ? [
    { title: "New Job", url: createPageUrl("CleaningJobs"), icon: CheckSquare, color: "bg-blue-500" },
    { title: "New Client", url: createPageUrl("CleaningClients"), icon: Users, color: "bg-purple-500" },
    { title: "AI Optimizer", url: createPageUrl("CleaningAI"), icon: Sparkles, color: "bg-pink-500" }
  ] : [
    { title: "New Project", url: createPageUrl("ProjectWizard"), icon: FolderOpen, color: "bg-blue-500" },
    { title: "New Task", url: createPageUrl("Tasks"), icon: CheckSquare, color: "bg-emerald-500" },
    { title: "New Client", url: createPageUrl("ClientOnboarding"), icon: Users, color: "bg-purple-500" },
    { title: "AI Assistant", url: createPageUrl("ConstructionAI"), icon: Sparkles, color: "bg-pink-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {currentUser?.full_name || 'User'}
          </h1>
          <p className="text-slate-600 mt-1">Here's what's happening with your {businessMode} business today</p>
        </div>

        {stats.tasks.overdue > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">
                  You have {stats.tasks.overdue} overdue task{stats.tasks.overdue > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-orange-700">Review and update their status</p>
              </div>
              <Link to={createPageUrl("Tasks")}>
                <Button size="sm" variant="outline">View Tasks</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                {businessMode === 'cleaning' ? 'Jobs' : 'Projects'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-900">{stats.projects.active}</p>
                <p className="text-sm text-slate-500">{stats.projects.total} total</p>
              </div>
              <Link to={createPageUrl(businessMode === 'cleaning' ? "CleaningJobs" : "ProjectsList")}>
                <Button variant="link" className="p-0 h-auto mt-2" size="sm">
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-900">{stats.tasks.dueToday}</p>
                <p className="text-sm text-slate-500">Due today</p>
              </div>
              <Link to={createPageUrl("Tasks")}>
                <Button variant="link" className="p-0 h-auto mt-2" size="sm">
                  View tasks <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-900">{stats.clients.active}</p>
                <p className="text-sm text-slate-500">{stats.clients.total} total</p>
              </div>
              <Link to={createPageUrl(businessMode === 'cleaning' ? "CleaningClients" : "ClientList")}>
                <Button variant="link" className="p-0 h-auto mt-2" size="sm">
                  View clients <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-900">{stats.events.today}</p>
                <p className="text-sm text-slate-500">{stats.events.thisWeek} this week</p>
              </div>
              <Link to={createPageUrl("Calendar")}>
                <Button variant="link" className="p-0 h-auto mt-2" size="sm">
                  View calendar <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickActions.map((action) => (
                    <Link key={action.title} to={action.url}>
                      <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4 hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium">{action.title}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        {activity.type === 'project' && <FolderOpen className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'job' && <CheckSquare className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'task' && <CheckSquare className="w-4 h-4 text-emerald-600" />}
                        {activity.type === 'client' && <Users className="w-4 h-4 text-purple-600" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {activity.item.name || activity.item.title || activity.item.company_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {activity.type === 'project' && `Status: ${activity.item.status}`}
                            {activity.type === 'job' && `Status: ${activity.item.status}`}
                            {activity.type === 'task' && `Due: ${activity.item.due_date || 'No date'}`}
                            {activity.type === 'client' && `${activity.item.email}`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(activity.item.created_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {businessMode === 'construction' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900">
                          ${stats.revenue.total.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Pending</p>
                        <p className="text-xl font-semibold text-orange-600">
                          ${stats.revenue.pending.toLocaleString()}
                        </p>
                      </div>
                      <Link to={createPageUrl("FinancialDashboard")}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Financials <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Time This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-slate-900">{stats.hoursThisWeek}h</p>
                    <p className="text-sm text-slate-600 mt-1">Hours logged</p>
                    <Link to={createPageUrl("TimeTracking")}>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Track Time <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl("Reports")}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Reports
                  </Button>
                </Link>
                <Link to={createPageUrl("FileManager")}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents
                  </Button>
                </Link>
                <Link to={createPageUrl("Analytics")}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}