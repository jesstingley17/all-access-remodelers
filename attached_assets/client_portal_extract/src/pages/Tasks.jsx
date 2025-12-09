import React, { useState, useEffect, useCallback } from "react";
import { Task } from "@/api/entities";
import { Project } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Filter,
  Wand2
} from "lucide-react";
import { InvokeLLM } from "@/api/integrations";

import KanbanBoard from "../components/tasks/KanbanBoard";
import TaskList from "../components/tasks/TaskList";
import TaskGantt from "../components/tasks/TaskGantt";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskCreationModal from "../components/tasks/TaskCreationModal";
import TaskDependencyManager from "../components/tasks/TaskDependencyManager";
import AITaskSuggestions from "../components/tasks/AITaskSuggestions";
import AISmartPrioritizer from "../components/tasks/AISmartPrioritizer";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    project: "all",
    priority: "all",
    status: "all",
    assignee: "all"
  });
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [dependencyTask, setDependencyTask] = useState(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [tasksData, projectsData] = await Promise.all([
        Task.filter(userFilter, "-updated_date"),
        Project.filter(userFilter, "-updated_date")
      ]);
      setTasks(tasksData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setTasks([]);
      setProjects([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  const applyFilters = useCallback(() => {
    let filtered = [...tasks];

    if (filters.project !== "all") {
      filtered = filtered.filter(task => task.project_id === filters.project);
    }
    if (filters.priority !== "all") {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    if (filters.status !== "all") {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    if (filters.assignee !== "all") {
      filtered = filtered.filter(task => task.assignee === filters.assignee);
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Error fetching user:", e);
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

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAIPrioritize = async () => {
    setIsPrioritizing(true);
    const openTasks = tasks.filter(t => t.status !== 'completed');
    
    const taskContext = openTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        due_date: t.due_date,
        project_id: t.project_id
    }));

    const detailedTaskContext = taskContext.map(task => {
        const project = projects.find(p => p.id === task.project_id);
        return {
            ...task,
            project_name: project ? project.title : "N/A",
            project_priority: project ? project.priority : "N/A"
        };
    });

    const prompt = `You are a productivity expert. Analyze these freelancer tasks and prioritize them using current project management best practices and productivity research.
    
    Consider:
    - Task deadlines and urgency
    - Project priorities and business impact
    - Dependencies and workflow optimization
    - Current productivity trends and methodologies
    
    Tasks to prioritize:
    ${JSON.stringify(detailedTaskContext, null, 2)}
    
    Provide intelligent prioritization based on modern productivity frameworks like Getting Things Done, Eisenhower Matrix, and agile methodologies.`;

    try {
        const response = await InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    prioritized_tasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                task_id: { type: "string" },
                                new_priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                                reasoning: { type: "string" }
                            },
                            required: ["task_id", "new_priority"]
                        }
                    }
                }
            }
        });

        if (response.prioritized_tasks) {
            for (const item of response.prioritized_tasks) {
                const validPriorities = ["low", "medium", "high", "urgent"];
                const priorityToSet = validPriorities.includes(item.new_priority) ? item.new_priority : 'medium';

                await Task.update(item.task_id, {
                    priority: priorityToSet
                });
            }
            loadData();
        }
    } catch (error) {
        console.error("Error prioritizing tasks with AI:", error);
    }
    setIsPrioritizing(false);
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await Task.update(taskId, updates);
      loadData();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleSaveDependencies = async (dependencies) => {
    try {
      await Task.update(dependencyTask.id, { dependencies });
      setShowDependencyModal(false);
      setDependencyTask(null);
      loadData();
    } catch (error) {
      console.error('Error updating dependencies:', error);
    }
  };

  const handleTaskCreate = async (taskData) => {
    try {
      const subtasksToCreate = taskData._subtasks || [];
      delete taskData._subtasks;
      
      const createdTask = await Task.create(taskData);
      
      // Create subtasks if any were generated by AI
      if (subtasksToCreate.length > 0) {
        for (const subtask of subtasksToCreate) {
          await Task.create({
            ...subtask,
            project_id: taskData.project_id,
            parent_task_id: createdTask.id,
            status: 'todo',
            priority: taskData.priority
          });
        }
      }
      
      loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-lg text-slate-700">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to manage your tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Task Management</h1>
            <p className="text-slate-600 mt-1 font-medium">Organize and track your work across all projects</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleAIPrioritize}
              disabled={isPrioritizing || isLoading}
              className="bg-white"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isPrioritizing ? "Prioritizing..." : "AI Prioritize"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Tasks</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="text-2xl font-bold text-blue-600">{stats.todo}</div>
            <div className="text-sm text-slate-600">To Do</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
            <div className="text-sm text-slate-600">In Progress</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="text-2xl font-bold text-purple-600">{stats.review}</div>
            <div className="text-sm text-slate-600">Review</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-slate-600">Overdue</div>
          </div>
        </div>

        {showFilters && (
          <TaskFilters 
            filters={filters}
            onFilterChange={setFilters}
            projects={projects}
            tasks={tasks}
          />
        )}

        <AISmartPrioritizer 
          tasks={filteredTasks}
          projects={projects}
          onApplyPriority={handleTaskUpdate}
        />

        <AITaskSuggestions 
          projects={projects}
          tasks={tasks}
          onCreateTask={handleTaskCreate}
        />

        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard 
              tasks={filteredTasks}
              projects={projects}
              onTaskUpdate={handleTaskUpdate}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <TaskList 
              tasks={filteredTasks}
              projects={projects}
              onTaskUpdate={handleTaskUpdate}
              onManageDependencies={(task) => {
                setDependencyTask(task);
                setShowDependencyModal(true);
              }}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="gantt" className="mt-6">
            <TaskGantt 
              tasks={filteredTasks}
              projects={projects}
              onTaskUpdate={handleTaskUpdate}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {showCreateModal && (
          <TaskCreationModal
            projects={projects}
            allTasks={tasks}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleTaskCreate}
          />
        )}

        {showDependencyModal && dependencyTask && (
          <TaskDependencyManager
            task={dependencyTask}
            allTasks={tasks}
            onSave={handleSaveDependencies}
            onClose={() => {
              setShowDependencyModal(false);
              setDependencyTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
}