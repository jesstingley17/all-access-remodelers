import React, { useState, useEffect, useCallback } from "react";
import { Project, Task, Client } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  LayoutDashboard,
  FolderOpen, 
  CheckSquare,
  Clock,
  Flag,
  Calendar,
  User as UserIcon,
  Plus,
  Filter,
  Search,
  TrendingUp,
  AlertCircle,
  Settings
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  todo: "bg-slate-100 text-slate-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800"
};

const priorityColors = {
  low: "text-slate-600",
  medium: "text-blue-600", 
  high: "text-amber-600",
  urgent: "text-red-600"
};

const projectStatusColors = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  on_hold: "bg-amber-100 text-amber-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function SummaryDashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [projectsData, tasksData, clientsData] = await Promise.all([
        Project.filter(userFilter, "-updated_date"),
        Task.filter(userFilter, "-updated_date"),
        Client.filter(userFilter, "-updated_date")
      ]);
      
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await Task.update(taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      // Recalculate project progress
      await recalculateProjectProgress(tasks.find(t => t.id === taskId)?.project_id);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskPriorityChange = async (taskId, newPriority) => {
    try {
      await Task.update(taskId, { priority: newPriority });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      ));
    } catch (error) {
      console.error("Error updating task priority:", error);
    }
  };

  const recalculateProjectProgress = async (projectId) => {
    if (!projectId) return;
    
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    if (projectTasks.length === 0) return;
    
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const progress = Math.round((completedTasks / projectTasks.length) * 100);
    
    try {
      await Project.update(projectId, { completion_percentage: progress });
      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, completion_percentage: progress } : project
      ));
    } catch (error) {
      console.error("Error updating project progress:", error);
    }
  };

  const filteredData = projects.map(project => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const client = clients.find(c => c.id === project.client_id);
    
    const filteredTasks = projectTasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = selectedProject === "all" || project.id === selectedProject;
      const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
      
      return matchesSearch && matchesProject && matchesStatus;
    });

    return {
      ...project,
      client,
      tasks: filteredTasks,
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter(t => t.status === 'completed').length,
      overdueTasks: projectTasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length
    };
  }).filter(project => 
    selectedProject === "all" || project.id === selectedProject ||
    (selectedProject === "all" && project.tasks.length > 0)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-200 rounded w-64"></div>
            <div className="grid gap-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to view your project summary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              Project Summary Dashboard
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Manage all your projects and tasks from one central location</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-xs text-slate-600">Projects</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
              <div className="text-2xl font-bold text-emerald-600">{tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-xs text-slate-600">Completed</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length}
              </div>
              <div className="text-xs text-slate-600">Overdue</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search projects or tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={loadData} variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Summary */}
        <div className="space-y-6">
          {filteredData.map(project => (
            <Card key={project.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <FolderOpen className="w-6 h-6 text-slate-600 mt-1" />
                    <div>
                      <CardTitle className="text-xl text-slate-900">{project.title}</CardTitle>
                      <div className="flex items-center gap-3 mt-2">
                        {project.client && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <UserIcon className="w-4 h-4" />
                            {project.client.company_name}
                          </div>
                        )}
                        <Badge className={projectStatusColors[project.status]}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        {project.due_date && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(project.due_date), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Progress</div>
                      <div className="text-lg font-bold text-slate-900">
                        {project.completion_percentage || 0}%
                      </div>
                    </div>
                    <Progress 
                      value={project.completion_percentage || 0} 
                      className="w-24" 
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Project Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-900">{project.totalTasks}</div>
                      <div className="text-xs text-slate-600">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-600">{project.completedTasks}</div>
                      <div className="text-xs text-slate-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{project.tasks.filter(t => t.status === 'in_progress').length}</div>
                      <div className="text-xs text-slate-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{project.overdueTasks}</div>
                      <div className="text-xs text-slate-600">Overdue</div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  {project.tasks.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        Tasks ({project.tasks.length})
                      </h4>
                      
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {project.tasks.map(task => {
                          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                          
                          return (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  checked={task.status === 'completed'}
                                  onCheckedChange={(checked) => 
                                    handleTaskStatusChange(task.id, checked ? 'completed' : 'todo')
                                  }
                                />
                                
                                <div className="flex-1">
                                  <div className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                    {task.title}
                                  </div>
                                  
                                  <div className="flex items-center gap-3 mt-1">
                                    {task.due_date && (
                                      <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(task.due_date), 'MMM d')}
                                        {isOverdue && <AlertCircle className="w-3 h-3" />}
                                      </div>
                                    )}
                                    
                                    {task.estimated_hours && (
                                      <div className="flex items-center gap-1 text-xs text-slate-600">
                                        <Clock className="w-3 h-3" />
                                        {task.estimated_hours}h
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={task.priority} 
                                  onValueChange={(value) => handleTaskPriorityChange(task.id, value)}
                                >
                                  <SelectTrigger className="w-24 h-8">
                                    <div className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
                                      <Flag className="w-3 h-3" />
                                      <span className="text-xs capitalize">{task.priority}</span>
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Select 
                                  value={task.status} 
                                  onValueChange={(value) => handleTaskStatusChange(task.id, value)}
                                >
                                  <SelectTrigger className="w-28 h-8">
                                    <Badge className={statusColors[task.status]} variant="secondary">
                                      {task.status.replace('_', ' ')}
                                    </Badge>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No tasks match your current filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="text-center py-12">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No projects found</h3>
              <p className="text-slate-500 mb-6">Adjust your filters or create your first project to get started.</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}