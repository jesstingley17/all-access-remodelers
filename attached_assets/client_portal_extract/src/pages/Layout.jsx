
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Timer,
  Plus,
  BarChart2,
  Calendar,
  FileArchive,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Briefcase,
  Monitor,
  HardHat,
  Sparkles
} from "lucide-react";
import BusinessModeSwitcher from "@/components/common/BusinessModeSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "@/components/notifications/NotificationBell";

const getNavigationItems = (businessMode, userEmail) => {
  const allowedEmails = ['admin@allaccessremodelers.com', 'thrivebyjessicalee@gmail.com'];
  const isAdmin = allowedEmails.includes(userEmail);
  
  // Admin users get access to all dashboards
  if (isAdmin) {
    return [
      { title: "Home", url: createPageUrl("Home"), icon: LayoutDashboard },
      { title: "Cleaning Dashboard", url: createPageUrl("CleaningDashboard"), icon: Monitor },
      { title: "Construction Dashboard", url: createPageUrl("ConstructionDashboard"), icon: HardHat },
      { title: "Projects", url: createPageUrl("ProjectsList"), icon: FolderOpen },
      { title: "Jobs", url: createPageUrl("CleaningJobs"), icon: CheckSquare },
      { title: "Tasks", url: createPageUrl("Tasks"), icon: CheckSquare },
      { title: "Clients", url: createPageUrl("ClientList"), icon: Users },
      { title: "Cleaning Clients", url: createPageUrl("CleaningClients"), icon: Users },
      { title: "Staff", url: createPageUrl("CleaningStaff"), icon: Users },
      { title: "AI Intelligence", url: createPageUrl("ConstructionAI"), icon: Sparkles },
      { title: "AI Optimizer", url: createPageUrl("CleaningAI"), icon: Sparkles },
      { title: "AI Assistant", url: createPageUrl("AIProjectAssistant"), icon: Sparkles },
      { title: "Communication", url: createPageUrl("CommunicationHub"), icon: MessageSquare },
      { title: "Resources", url: createPageUrl("ResourceAllocation"), icon: Users },
      { title: "Time Tracking", url: createPageUrl("TimeTracking"), icon: Timer },
      { title: "Financials", url: createPageUrl("FinancialDashboard"), icon: DollarSign },
      { title: "Invoices", url: createPageUrl("Invoices"), icon: Briefcase },
      { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart2 },
      { title: "Reports", url: createPageUrl("Reports"), icon: TrendingUp },
      { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
      { title: "File Manager", url: createPageUrl("FileManager"), icon: FileArchive },
      { title: "Support", url: createPageUrl("CustomerSupport"), icon: MessageSquare },
      { title: "Invites", url: createPageUrl("InviteManagement"), icon: Mail }
    ];
  }
  
  if (businessMode === 'cleaning') {
    return [
      { title: "Home", url: createPageUrl("Home"), icon: LayoutDashboard },
      { title: "Cleaning Dashboard", url: createPageUrl("CleaningDashboard"), icon: LayoutDashboard },
      { title: "Clients", url: createPageUrl("CleaningClients"), icon: Users },
      { title: "Jobs", url: createPageUrl("CleaningJobs"), icon: CheckSquare },
      { title: "Staff", url: createPageUrl("CleaningStaff"), icon: Users },
      { title: "AI Optimizer", url: createPageUrl("CleaningAI"), icon: Sparkles },
      { title: "Support", url: createPageUrl("CustomerSupport"), icon: MessageSquare },
      { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
    ];
  }
  
  return [
    { title: "Home", url: createPageUrl("Home"), icon: LayoutDashboard },
    { title: "Construction Dashboard", url: createPageUrl("ConstructionDashboard"), icon: LayoutDashboard },
    { title: "Projects", url: createPageUrl("ProjectsList"), icon: FolderOpen },
    { title: "Tasks", url: createPageUrl("Tasks"), icon: CheckSquare },
    { title: "AI Intelligence", url: createPageUrl("ConstructionAI"), icon: Sparkles },
    { title: "Clients", url: createPageUrl("ClientList"), icon: Users },
    { title: "Communication", url: createPageUrl("CommunicationHub"), icon: MessageSquare },
    { title: "Resources", url: createPageUrl("ResourceAllocation"), icon: Users },
    { title: "Time Tracking", url: createPageUrl("TimeTracking"), icon: Timer },
    { title: "Financials", url: createPageUrl("FinancialDashboard"), icon: DollarSign },
    { title: "Invoices", url: createPageUrl("Invoices"), icon: Briefcase },
    { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart2 },
    { title: "Reports", url: createPageUrl("Reports"), icon: TrendingUp },
    { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
    { title: "File Manager", url: createPageUrl("FileManager"), icon: FileArchive },
  ];
};

const getQuickActions = (businessMode) => {
  if (businessMode === 'cleaning') {
    return [
      { title: "New Job", url: createPageUrl("CleaningJobs"), icon: Plus, color: "text-blue-600 bg-blue-100" },
      { title: "New Client", url: createPageUrl("CleaningClients"), icon: Users, color: "text-purple-600 bg-purple-100" }
    ];
  }
  
  return [
    { title: "New Project", url: createPageUrl("ProjectWizard"), icon: Plus, color: "text-blue-600 bg-blue-100" },
    { title: "New Task", url: createPageUrl("Tasks"), icon: CheckSquare, color: "text-emerald-600 bg-emerald-100" },
    { title: "New Client", url: createPageUrl("ClientOnboarding"), icon: Users, color: "text-purple-600 bg-purple-100" }
  ];
};

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({ activeProjects: 0, dueToday: 0, hoursThisWeek: 0 });
    const [businessMode, setBusinessMode] = useState('construction');

    // Show Landing page without layout wrapper
    if (currentPageName === 'Landing') {
      return <>{children}</>;
    }

  const loadInitialData = useCallback(async (user) => {
    if (!user) return;
    try {
      const userFilter = { created_by: user.email };
      
      if (user.business_mode === 'cleaning') {
        const [jobsData] = await Promise.all([
          base44.entities.CleaningJob.filter(userFilter)
        ]);
        const activeJobs = jobsData.filter(j => j.status === 'scheduled' || j.status === 'in_progress').length;
        setStats({ activeProjects: activeJobs, dueToday: 0, hoursThisWeek: 0 });
      } else {
        const [projectsData, tasksData, timeData] = await Promise.all([
          base44.entities.Project.filter(userFilter),
          base44.entities.Task.filter(userFilter),
          base44.entities.TimeEntry.filter(userFilter)
        ]);
        
        const activeProjects = projectsData.filter(p => p.status === 'active').length;
        const today = new Date().toDateString();
        const dueToday = tasksData.filter(t => t.due_date && new Date(t.due_date).toDateString() === today && t.status !== 'completed').length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const hoursThisWeek = timeData
          .filter(t => new Date(t.created_date) >= oneWeekAgo)
          .reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60;

        setStats({ activeProjects, dueToday, hoursThisWeek: hoursThisWeek.toFixed(1) });
      }
    } catch (error) {
      console.error("Error loading layout stats:", error);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const mode = user.business_mode || 'construction';
        setBusinessMode(mode);
        loadInitialData(user);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    initialize();
    }, [loadInitialData]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar className="border-r border-slate-200/60 bg-white/90 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692298dd0bb845c13d256fec/93108b689_IMG_3209.JPG"
                alt="All Access Remodelers"
                className="w-10 h-10 rounded-xl object-contain"
              />
              <div>
                <h2 className="font-bold text-slate-900 text-lg tracking-tight">
                  All Access Remodelers
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Construction | Property | Cleaning
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getNavigationItems(businessMode, currentUser?.email).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-slate-100 hover:text-slate-900 transition-all duration-300 rounded-xl mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-orange-50 to-blue-50 text-slate-900 shadow-sm border border-orange-200' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 font-medium">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getQuickActions(businessMode).map((action) => (
                    <SidebarMenuItem key={action.title}>
                      <SidebarMenuButton asChild>
                        <Link to={action.url} className="flex items-center gap-3 px-4 py-3 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300 rounded-xl">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                            <action.icon className="w-4 h-4" />
                          </div>
                          <span>{action.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Overview
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Active Projects</span>
                    <span className="font-bold text-orange-600">{stats.activeProjects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Tasks Due Today</span>
                    <span className="font-bold text-blue-900">{stats.dueToday}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Hours This Week</span>
                    <span className="font-bold text-orange-600">{stats.hoursThisWeek}h</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <BusinessModeSwitcher 
                currentMode={businessMode} 
                onModeChange={setBusinessMode}
              />
              <NotificationBell currentUser={currentUser} />
            </div>
            <div className="flex items-center gap-3">
              <Avatar>
                  <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.full_name} />
                  <AvatarFallback>{currentUser?.full_name ? currentUser.full_name[0] : 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{currentUser?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email || 'Not logged in'}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">{currentPageName}</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
