import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Timer, 
  TrendingUp,
  Clock,
  Target
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export default function TimeTrackingSummary({ timeEntries, isLoading }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Filter this week's entries
  const thisWeekEntries = timeEntries.filter(entry => 
    isWithinInterval(new Date(entry.created_date), { start: weekStart, end: weekEnd })
  );

  // Calculate stats
  const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60;
  const billableHours = thisWeekEntries
    .filter(entry => entry.is_billable)
    .reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60;
  
  const targetHours = 40; // Weekly target
  const completionRate = (thisWeekHours / targetHours) * 100;

  // Group by day for mini chart
  const dailyHours = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateKey = format(date, 'yyyy-MM-dd');
    dailyHours[dateKey] = 0;
  }

  thisWeekEntries.forEach(entry => {
    const dateKey = format(new Date(entry.created_date), 'yyyy-MM-dd');
    if (dailyHours[dateKey] !== undefined) {
      dailyHours[dateKey] += (entry.duration_minutes || 0) / 60;
    }
  });

  const maxDailyHours = Math.max(...Object.values(dailyHours), 1);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Timer className="w-5 h-5" />
          This Week's Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between">
              {Array(7).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-6" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Weekly Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Weekly Progress</span>
                <span className="text-sm font-medium text-slate-900">
                  {thisWeekHours.toFixed(1)}h / {targetHours}h
                </span>
              </div>
              <Progress value={Math.min(completionRate, 100)} className="h-3" />
              <div className="flex justify-between text-xs text-slate-600">
                <span>{completionRate.toFixed(0)}% of target</span>
                <span>{(targetHours - thisWeekHours).toFixed(1)}h remaining</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{thisWeekHours.toFixed(1)}h</div>
                <div className="text-xs text-blue-700">Total Hours</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{billableHours.toFixed(1)}h</div>
                <div className="text-xs text-emerald-700">Billable</div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Daily Breakdown</h4>
              <div className="flex items-end justify-between gap-1 h-16">
                {Object.entries(dailyHours).map(([date, hours]) => {
                  const barHeight = maxDailyHours > 0 ? (hours / maxDailyHours) * 100 : 0;
                  const dayName = format(new Date(date), 'EEE')[0];
                  
                  return (
                    <div key={date} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full bg-slate-200 rounded-sm flex flex-col justify-end" style={{ height: '48px' }}>
                        <div 
                          className="bg-blue-500 rounded-sm transition-all duration-300"
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{dayName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-slate-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Avg per day</span>
                </div>
                <span className="font-medium text-slate-900">{(thisWeekHours / 7).toFixed(1)}h</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}