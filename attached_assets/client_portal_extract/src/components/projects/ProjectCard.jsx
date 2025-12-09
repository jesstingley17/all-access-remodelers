import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  DollarSign, 
  Clock,
  User,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const statusColors = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  on_hold: "bg-amber-100 text-amber-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800"
};

const priorityColors = {
  low: "border-slate-300",
  medium: "border-blue-300",
  high: "border-amber-300",
  urgent: "border-red-300"
};

const riskColors = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-red-600"
};

export default function ProjectCard({ project, clients }) {
  const client = clients.find(c => c.id === project.client_id);
  const isOverdue = project.due_date && new Date(project.due_date) < new Date() && project.status !== 'completed';

  return (
    <Card className={`bg-white/80 backdrop-blur-sm shadow-lg border-2 ${priorityColors[project.priority]} hover:shadow-xl transition-all duration-300 group`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-slate-700 transition-colors line-clamp-1">
                  {project.title}
                </h3>
                {isOverdue && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
            </div>
          </div>

          {/* Client & Type */}
          <div className="space-y-2">
            {client && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span className="font-medium">{client.company_name}</span>
              </div>
            )}
            <div className="flex gap-2">
              <Badge className={statusColors[project.status]}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {project.project_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Progress</span>
              <span className="text-sm font-medium text-slate-900">{project.completion_percentage || 0}%</span>
            </div>
            <Progress value={project.completion_percentage || 0} className="h-2" />
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div className="space-y-2">
              {project.budget && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <DollarSign className="w-3 h-3" />
                  <span>${project.budget.toLocaleString()}</span>
                </div>
              )}
              {project.estimated_hours && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-3 h-3" />
                  <span>{project.estimated_hours}h estimated</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {project.due_date && (
                <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(project.due_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              {project.risk_assessment?.overall_risk && (
                <div className={`text-sm font-medium ${riskColors[project.risk_assessment.overall_risk]}`}>
                  {project.risk_assessment.overall_risk.toUpperCase()} RISK
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="pt-3 border-t border-slate-200">
            <Link to={createPageUrl(`ProjectDetail/${project.id}`)}>
              <div className="flex items-center justify-between text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                <span className="font-medium">View Project</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}