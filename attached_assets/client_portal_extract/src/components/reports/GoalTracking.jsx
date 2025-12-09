import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Target, 
  Plus, 
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  Users,
  Award,
  CheckCircle
} from "lucide-react";
import { BusinessGoal } from "@/api/entities";
import { format, differenceInDays } from 'date-fns';

import GoalCreationModal from './GoalCreationModal';

const goalIcons = {
  revenue: DollarSign,
  profit: TrendingUp,
  billable_hours: Clock,
  new_clients: Users,
  project_count: Target,
  efficiency: Award,
  client_satisfaction: CheckCircle
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export default function GoalTracking({ goals, businessData, onGoalUpdate, isLoading }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const calculateGoalProgress = (goal) => {
    const { projects, tasks, timeEntries, invoices, clients } = businessData;
    let currentValue = goal.current_value || 0;

    switch (goal.goal_type) {
      case 'revenue':
        currentValue = invoices
          .filter(inv => inv.status === 'paid' && 
                        new Date(inv.issue_date) >= new Date(goal.start_date) &&
                        new Date(inv.issue_date) <= new Date(goal.end_date))
          .reduce((sum, inv) => sum + inv.total_amount, 0);
        break;
      
      case 'billable_hours':
        currentValue = timeEntries
          .filter(entry => entry.is_billable && 
                          new Date(entry.start_time) >= new Date(goal.start_date) &&
                          new Date(entry.start_time) <= new Date(goal.end_date))
          .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);
        break;
      
      case 'new_clients':
        currentValue = clients
          .filter(client => new Date(client.created_date) >= new Date(goal.start_date) &&
                           new Date(client.created_date) <= new Date(goal.end_date))
          .length;
        break;
      
      case 'project_count':
        currentValue = projects
          .filter(project => project.status === 'completed' &&
                            new Date(project.start_date || project.created_date) >= new Date(goal.start_date) &&
                            new Date(project.start_date || project.created_date) <= new Date(goal.end_date))
          .length;
        break;
      
      default:
        // Use stored current_value for other goal types
        break;
    }

    const progress = goal.target_value > 0 ? (currentValue / goal.target_value) * 100 : 0;
    const daysRemaining = differenceInDays(new Date(goal.end_date), new Date());
    const isOverdue = daysRemaining < 0 && !goal.achieved;

    return {
      currentValue,
      progress: Math.min(progress, 100),
      daysRemaining: Math.max(daysRemaining, 0),
      isOverdue,
      isAchieved: progress >= 100
    };
  };

  const handleCreateGoal = () => {
    setShowCreateModal(true);
  };

  const handleGoalSave = (goalData) => {
    onGoalUpdate();
    setShowCreateModal(false);
  };

  const formatValue = (value, unit) => {
    switch (unit) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'hours':
        return `${value.toFixed(1)}h`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return value.toString();
      default:
        return value.toString();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Business Goals</h2>
          <p className="text-slate-600">Track your progress towards key business objectives</p>
        </div>
        <Button onClick={handleCreateGoal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const IconComponent = goalIcons[goal.goal_type] || Target;
            const goalProgress = calculateGoalProgress(goal);
            
            return (
              <Card key={goal.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 relative overflow-hidden">
                {goalProgress.isAchieved && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-900 mb-1">{goal.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={priorityColors[goal.priority]}>
                          {goal.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {goal.period}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Progress</span>
                      <span className="text-sm font-bold text-slate-900">
                        {goalProgress.progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={goalProgress.progress} className="h-2" />
                  </div>
                  
                  {/* Values */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Current</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatValue(goalProgress.currentValue, goal.unit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Target</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatValue(goal.target_value, goal.unit)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {goalProgress.isOverdue ? 'Overdue' : `${goalProgress.daysRemaining} days left`}
                        </span>
                      </div>
                      <span className="text-slate-500">
                        {format(new Date(goal.end_date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {goal.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Goals Set</h3>
            <p className="text-slate-500 mb-6">
              Start tracking your business progress by setting measurable goals.
            </p>
            <Button onClick={handleCreateGoal} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goal Creation Modal */}
      {showCreateModal && (
        <GoalCreationModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleGoalSave}
        />
      )}
    </div>
  );
}