import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Flag, 
  Calendar,
  User,
  MoreHorizontal,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-purple-100' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-100' }
];

const priorityColors = {
  low: "text-slate-600 border-slate-300",
  medium: "text-blue-600 border-blue-300",
  high: "text-amber-600 border-amber-300",
  urgent: "text-red-600 border-red-300"
};

export default function KanbanBoard({ tasks, projects, onTaskUpdate, isLoading }) {
  const [draggedTask, setDraggedTask] = useState(null);

  // Add safety checks for props that might be undefined or null
  const safeTasks = tasks || [];
  const safeProjects = projects || [];

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      onTaskUpdate(draggedTask.id, { status: newStatus });
    }
    setDraggedTask(null);
  };

  const getProjectName = (projectId) => {
    // Add safety check for projectId
    if (!projectId) return 'No Project';
    // Use safeProjects and add a check for 'p' being truthy
    const project = safeProjects.find(p => p && p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const isTaskOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  const isAISuggested = (task) => {
    return task.priority === 'urgent' || 
           (task.due_date && new Date(task.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ||
           (task.dependencies && task.dependencies.length > 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {COLUMNS.map((column) => {
        // Filter tasks, ensuring each task object is valid
        const columnTasks = safeTasks.filter(task => task && task.status === column.id);
        
        return (
          <Card key={column.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className={`pb-3 ${column.color} rounded-t-lg`}>
              <CardTitle className="flex items-center justify-between text-slate-900">
                <span>{column.title}</span>
                <Badge variant="secondary" className="bg-white/70">
                  {columnTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent 
              className="p-3 min-h-96 space-y-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border border-slate-200 animate-pulse">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))
              ) : (
                columnTasks.map((task) => {
                  // Ensure task is not null or undefined before rendering
                  if (!task) return null;
                  
                  const isOverdue = isTaskOverdue(task.due_date) && task.status !== 'completed';
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={`p-4 rounded-lg border-2 cursor-move transition-all duration-200 hover:shadow-md ${
                        isAISuggested(task) ? 'border-purple-400 bg-purple-50' : ''
                      } ${
                        // Provide a fallback for priorityColors in case task.priority is missing
                        priorityColors[task.priority] || priorityColors.medium
                      } ${draggedTask?.id === task.id ? 'opacity-50 rotate-2' : !isAISuggested(task) ? 'bg-white' : ''}`}
                    >
                      <div className="space-y-3">
                        {/* Task Header */}
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 flex-1">
                            {task.title || 'Untitled Task'} {/* Fallback for missing title */}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Project Name */}
                        <div className="text-xs text-slate-600 font-medium">
                          {getProjectName(task.project_id)}
                        </div>

                        {/* Task Details */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Flag className={`w-3 h-3 ${(priorityColors[task.priority] || priorityColors.medium).split(' ')[0]}`} />
                            <span className="capitalize">{task.priority || 'medium'}</span> {/* Fallback for missing priority */}
                          </div>
                          {isAISuggested(task) && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs px-1.5 py-0">
                              <Sparkles className="w-2.5 h-2.5 mr-1" />
                              AI
                            </Badge>
                          )}
                          {task.estimated_hours && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.estimated_hours}h</span>
                            </div>
                          )}
                        </div>

                        {/* Due Date */}
                        {task.due_date && (
                          <div className={`flex items-center gap-1 text-xs ${
                            isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(task.due_date), 'MMM d')}</span>
                          </div>
                        )}

                        {/* Assignee */}
                        {task.assignee && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <User className="w-3 h-3" />
                            <span>{task.assignee}</span>
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {task.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{task.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {!isLoading && columnTasks.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}