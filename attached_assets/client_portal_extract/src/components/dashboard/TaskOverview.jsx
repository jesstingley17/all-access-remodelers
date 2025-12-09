import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare, 
  ArrowRight,
  Clock,
  AlertCircle,
  Flag
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function TaskOverview({ tasks, isLoading }) {
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    })
    .slice(0, 6);

  const completionRate = tasks.length > 0 
    ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 
    : 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CheckSquare className="w-5 h-5" />
            Task Overview
          </CardTitle>
          <Link to={createPageUrl("Tasks")}>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Overall Completion</span>
            <span className="text-sm font-medium text-slate-900">{completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 animate-pulse">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
              const isDueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();
              
              return (
                <div key={task.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-slate-900 text-sm line-clamp-1">{task.title}</h5>
                        {isOverdue && <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                        {isDueToday && !isOverdue && <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className={statusColors[task.status]} size="sm">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
                        <Flag className="w-3 h-3" />
                        <span>{task.priority}</span>
                      </div>
                      {task.estimated_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimated_hours}h</span>
                        </div>
                      )}
                    </div>
                    {task.due_date && (
                      <span className={isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-amber-600 font-medium' : ''}>
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-500">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No upcoming tasks. Great job!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}