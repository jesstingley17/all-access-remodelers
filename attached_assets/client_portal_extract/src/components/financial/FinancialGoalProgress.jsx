import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

export default function FinancialGoalProgress({ goals = [], projects = [], invoices = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics from data
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthRevenue = invoices
    .filter(inv => {
      const date = new Date(inv.issued_at || inv.created_date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear && inv.status === 'paid';
    })
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const metrics = {
    thisMonthRevenue,
    thisMonthProfit: thisMonthRevenue * 0.3 // Simplified
  };

  const activeGoals = goals.filter(goal => goal.is_active && !goal.achieved);
  
  const calculateProgress = (goal) => {
    let currentValue = 0;
    
    switch (goal.goal_type) {
      case 'revenue':
        currentValue = metrics.thisMonthRevenue;
        break;
      case 'profit':
        currentValue = metrics.thisMonthProfit;
        break;
      default:
        currentValue = goal.current_amount || 0;
    }
    
    return Math.min((currentValue / goal.target_amount) * 100, 100);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Target className="w-5 h-5" />
          Financial Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No active financial goals. Set some goals to track your progress!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeGoals.slice(0, 4).map((goal) => {
              const progress = calculateProgress(goal);
              const isOnTrack = progress >= 75; // Consider on track if 75% or more
              
              return (
                <div key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">{goal.title}</h4>
                      <p className="text-sm text-slate-600">{goal.period} goal</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">
                        ${goal.goal_type === 'revenue' ? metrics.thisMonthRevenue.toLocaleString() : 
                          goal.goal_type === 'profit' ? metrics.thisMonthProfit.toLocaleString() :
                          (goal.current_amount || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">
                        of ${goal.target_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={isOnTrack ? "default" : "secondary"}>
                      {progress.toFixed(0)}% Complete
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <TrendingUp className={`w-3 h-3 ${isOnTrack ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span>{isOnTrack ? 'On Track' : 'Behind'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}