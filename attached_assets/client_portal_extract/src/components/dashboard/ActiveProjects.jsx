import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen, 
  ArrowRight,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const statusColors = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  on_hold: "bg-amber-100 text-amber-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800"
};

const priorityColors = {
  low: "text-slate-600",
  medium: "text-blue-600",
  high: "text-amber-600",
  urgent: "text-red-600"
};

export default function ActiveProjects({ projects, isLoading }) {
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning').slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FolderOpen className="w-5 h-5" />
            Active Projects
          </CardTitle>
          <Link to={createPageUrl("Projects")}>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-200 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-2 w-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))
          ) : activeProjects.length > 0 ? (
            activeProjects.map((project) => {
              const isOverdue = project.due_date && new Date(project.due_date) < new Date() && project.status !== 'completed';
              
              return (
                <Link key={project.id} to={createPageUrl(`ProjectDetail/${project.id}`)}>
                  <div className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{project.title}</h4>
                          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1">{project.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={statusColors[project.status]}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[project.priority]}>
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600">Progress</span>
                        <span className="text-sm font-medium text-slate-900">{project.completion_percentage || 0}%</span>
                      </div>
                      <Progress value={project.completion_percentage || 0} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <div className="flex items-center gap-4">
                        {project.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>${project.budget.toLocaleString()}</span>
                          </div>
                        )}
                        {project.estimated_hours && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{project.estimated_hours}h</span>
                          </div>
                        )}
                      </div>
                      {project.due_date && (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(project.due_date), 'MMM d')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No active projects. Create your first project to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}