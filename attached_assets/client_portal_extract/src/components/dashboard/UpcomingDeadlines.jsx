import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  AlertCircle,
  Clock,
  CheckSquare,
  FolderOpen
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";

export default function UpcomingDeadlines({ tasks, projects, isLoading }) {
  // Combine tasks and project deadlines
  const allDeadlines = [
    ...tasks.filter(t => t.due_date && t.status !== 'completed').map(t => ({
      ...t,
      type: 'task',
      title: t.title,
      due_date: t.due_date
    })),
    ...projects.filter(p => p.due_date && p.status !== 'completed').map(p => ({
      ...p,
      type: 'project',
      title: p.title,
      due_date: p.due_date
    }))
  ]
  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  .slice(0, 8);

  const getDeadlineStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntil = differenceInDays(due, today);
    
    if (daysUntil < 0) return { status: 'overdue', color: 'text-red-600 bg-red-50', days: Math.abs(daysUntil) };
    if (daysUntil === 0) return { status: 'today', color: 'text-amber-600 bg-amber-50', days: 0 };
    if (daysUntil <= 3) return { status: 'soon', color: 'text-orange-600 bg-orange-50', days: daysUntil };
    return { status: 'upcoming', color: 'text-slate-600 bg-slate-50', days: daysUntil };
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Calendar className="w-5 h-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 animate-pulse">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : allDeadlines.length > 0 ? (
            allDeadlines.map((item) => {
              const deadlineInfo = getDeadlineStatus(item.due_date);
              const IconComponent = item.type === 'task' ? CheckSquare : FolderOpen;
              
              return (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${deadlineInfo.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">{item.title}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <span className="capitalize">{item.type}</span>
                      <span>•</span>
                      <span>{format(new Date(item.due_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="outline" className={`text-xs ${deadlineInfo.color} border-current`}>
                      {deadlineInfo.status === 'overdue' && `${deadlineInfo.days} days overdue`}
                      {deadlineInfo.status === 'today' && 'Due today'}
                      {deadlineInfo.status === 'soon' && `${deadlineInfo.days} days left`}
                      {deadlineInfo.status === 'upcoming' && `${deadlineInfo.days} days left`}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No upcoming deadlines. You're all caught up!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}