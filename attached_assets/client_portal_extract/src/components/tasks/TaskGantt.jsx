import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Flag, 
  Clock,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { format, differenceInDays, startOfDay, addDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  todo: "bg-slate-400",
  in_progress: "bg-blue-500",
  review: "bg-purple-500",
  completed: "bg-emerald-500"
};

const priorityColors = {
  low: "text-slate-600",
  medium: "text-blue-600",
  high: "text-amber-600",
  urgent: "text-red-600"
};

export default function TaskGantt({ tasks, projects, onTaskUpdate, isLoading }) {
  const svgRef = useRef(null);
  const taskRefs = useRef({});
  
  // Filter tasks with dates
  const tasksWithDates = tasks.filter(task => task.due_date || task.start_date);
  
  // Calculate timeline bounds
  const getTimelineBounds = () => {
    if (tasksWithDates.length === 0) return { start: new Date(), end: addDays(new Date(), 30) };
    
    const dates = tasksWithDates.flatMap(task => [
      task.start_date ? new Date(task.start_date) : null,
      task.due_date ? new Date(task.due_date) : null
    ].filter(Boolean));
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    return {
      start: startOfDay(minDate),
      end: addDays(startOfDay(maxDate), 7) // Add some buffer
    };
  };

  const { start: timelineStart, end: timelineEnd } = getTimelineBounds();
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  
  // Generate date headers
  const generateDateHeaders = () => {
    const headers = [];
    for (let i = 0; i <= totalDays; i += 7) { // Weekly headers
      const date = addDays(timelineStart, i);
      headers.push(date);
    }
    return headers;
  };

  const dateHeaders = generateDateHeaders();

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const getTaskPosition = (task) => {
    const taskStart = task.start_date ? new Date(task.start_date) : new Date(task.due_date);
    const taskEnd = task.due_date ? new Date(task.due_date) : taskStart;
    
    const startOffset = differenceInDays(taskStart, timelineStart);
    const duration = Math.max(1, differenceInDays(taskEnd, taskStart));
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const isTaskOverdue = (dueDate, status) => {
    return dueDate && new Date(dueDate) < new Date() && status !== 'completed';
  };

  // Draw dependency lines
  useEffect(() => {
    if (!svgRef.current || tasksWithDates.length === 0) return;

    const svg = svgRef.current;
    svg.innerHTML = ''; // Clear previous lines

    tasksWithDates.forEach((task, index) => {
      if (!task.dependencies || task.dependencies.length === 0) return;

      task.dependencies.forEach(depId => {
        const depTask = tasksWithDates.find(t => t.id === depId);
        if (!depTask) return;

        const depIndex = tasksWithDates.indexOf(depTask);
        const sourceElement = taskRefs.current[depTask.id];
        const targetElement = taskRefs.current[task.id];

        if (!sourceElement || !targetElement) return;

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = svg.parentElement.getBoundingClientRect();

        const x1 = sourceRect.right - containerRect.left;
        const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top;
        const x2 = targetRect.left - containerRect.left;
        const y2 = targetRect.top + targetRect.height / 2 - containerRect.top;

        // Create arrow path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX = (x1 + x2) / 2;
        
        path.setAttribute('d', `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`);
        path.setAttribute('stroke', '#64748b');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.setAttribute('class', 'dependency-line');

        svg.appendChild(path);
      });
    });
  }, [tasksWithDates]);

  const hasDependencies = tasksWithDates.some(t => t.dependencies && t.dependencies.length > 0);

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4 mb-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasksWithDates.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No timeline data</h3>
            <p className="text-slate-500">Tasks need start dates or due dates to appear in timeline view.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Timeline View
          {hasDependencies && (
            <Badge variant="outline" className="ml-2">
              <LinkIcon className="w-3 h-3 mr-1" />
              Dependencies
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto relative">
          <svg 
            ref={svgRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
              </marker>
            </defs>
          </svg>
          {/* Date Headers */}
          <div className="flex mb-4 text-sm text-slate-600 border-b border-slate-200 pb-2">
            <div className="w-80 flex-shrink-0"></div>
            <div className="flex-1 relative">
              <div className="flex">
                {dateHeaders.map((date, index) => (
                  <div 
                    key={index} 
                    className="flex-1 text-center px-2"
                    style={{ minWidth: `${100 / dateHeaders.length}%` }}
                  >
                    {format(date, 'MMM d')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="space-y-2">
            {tasksWithDates.map((task) => {
              const isOverdue = isTaskOverdue(task.due_date, task.status);
              const position = getTaskPosition(task);
              
              return (
                <div key={task.id} className="flex items-center group hover:bg-slate-50 rounded-lg p-2 transition-colors">
                  {/* Task Info */}
                  <div className="w-80 flex-shrink-0 pr-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 text-sm line-clamp-1">
                          {task.title}
                        </h4>
                        {isOverdue && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        {task.dependencies && task.dependencies.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <LinkIcon className="w-3 h-3 mr-1" />
                            {task.dependencies.length}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-600">
                        {getProjectName(task.project_id)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${statusColors[task.status].replace('bg-', 'text-').replace('500', '700')} bg-opacity-20`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <div className={`flex items-center gap-1 text-xs ${priorityColors[task.priority]}`}>
                          <Flag className="w-3 h-3" />
                          <span>{task.priority}</span>
                        </div>
                        {task.estimated_hours && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimated_hours}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-8 bg-slate-100 rounded" style={{ zIndex: 2 }}>
                    <div 
                      ref={el => taskRefs.current[task.id] = el}
                      className={`absolute top-1 bottom-1 rounded ${statusColors[task.status]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                      style={position}
                      title={`${task.title} - ${task.start_date ? format(new Date(task.start_date), 'MMM d') : ''} to ${task.due_date ? format(new Date(task.due_date), 'MMM d') : ''}`}
                    >
                      <div className="h-full flex items-center px-2">
                        <span className="text-white text-xs font-medium truncate">
                          {task.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}