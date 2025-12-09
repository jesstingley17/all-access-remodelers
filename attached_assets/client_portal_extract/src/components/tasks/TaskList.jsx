import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Clock, 
  Flag, 
  Calendar,
  User,
  MoreHorizontal,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function TaskList({ tasks, projects, onTaskUpdate, isLoading }) {
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const isTaskOverdue = (dueDate, status) => {
    return dueDate && new Date(dueDate) < new Date() && status !== 'completed';
  };

  const handleStatusChange = (taskId, newStatus) => {
    onTaskUpdate(taskId, { status: newStatus });
  };

  const isAISuggested = (task) => {
    return task.priority === 'urgent' || 
           (task.due_date && new Date(task.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ||
           (task.dependencies && task.dependencies.length > 0);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by priority first, then by due date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] || 1;
    const bPriority = priorityOrder[b.priority] || 1;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    if (a.due_date && b.due_date) {
      return new Date(a.due_date) - new Date(b.due_date);
    }
    
    return 0;
  });

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold text-slate-900">Task</TableHead>
                <TableHead className="font-semibold text-slate-900">Project</TableHead>
                <TableHead className="font-semibold text-slate-900">Status</TableHead>
                <TableHead className="font-semibold text-slate-900">Priority</TableHead>
                <TableHead className="font-semibold text-slate-900">Due Date</TableHead>
                <TableHead className="font-semibold text-slate-900">Time</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  </TableRow>
                ))
              ) : (
                sortedTasks.map((task) => {
                  const isOverdue = isTaskOverdue(task.due_date, task.status);
                  const isCompleted = task.status === 'completed';
                  
                  return (
                    <TableRow 
                      key={task.id} 
                      className={`hover:bg-slate-50 transition-colors ${isCompleted ? 'opacity-75' : ''}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={(checked) => 
                            handleStatusChange(task.id, checked ? 'completed' : 'todo')
                          }
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-slate-600 line-clamp-1">
                              {task.description}
                            </div>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-1">
                              {task.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {getProjectName(task.project_id)}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={statusColors[task.status]}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
                            <Flag className="w-3 h-3" />
                            <span className="text-sm font-medium capitalize">{task.priority}</span>
                          </div>
                          {isAISuggested(task) && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {task.due_date ? (
                          <div className={`flex items-center gap-1 text-sm ${
                            isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                            {isOverdue && <AlertCircle className="w-3 h-3" />}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">No due date</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {task.estimated_hours ? (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimated_hours}h</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No tasks found</h3>
            <p className="text-slate-500">Create your first task to get started with project management.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}