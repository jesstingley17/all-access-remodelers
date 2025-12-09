import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from '@/components/ui/skeleton';
import { startOfToday, startOfWeek, isWithinInterval } from 'date-fns';

export default function TimeTrackingStats({ timeEntries, isLoading }) {
  const calculateStats = () => {
    if (timeEntries.length === 0) {
      return { today: 0, thisWeek: 0, billablePercent: 0 };
    }

    const today = startOfToday();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    let todayMinutes = 0;
    let thisWeekMinutes = 0;
    let billableMinutes = 0;

    timeEntries.forEach(entry => {
      const entryDate = new Date(entry.start_time);
      if (isWithinInterval(entryDate, { start: today, end: new Date() })) {
        todayMinutes += entry.duration_minutes;
      }
      if (isWithinInterval(entryDate, { start: weekStart, end: new Date() })) {
        thisWeekMinutes += entry.duration_minutes;
        if (entry.is_billable) {
          billableMinutes += entry.duration_minutes;
        }
      }
    });

    return {
      today: todayMinutes / 60,
      thisWeek: thisWeekMinutes / 60,
      billablePercent: thisWeekMinutes > 0 ? (billableMinutes / thisWeekMinutes) * 100 : 0
    };
  };

  const stats = calculateStats();

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle>Time Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Today</span>
                <span className="font-bold text-slate-900">{stats.today.toFixed(1)}h</span>
              </div>
              <Progress value={(stats.today / 8) * 100} />
              <p className="text-xs text-slate-500">Goal: 8 hours</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">This Week</span>
                <span className="font-bold text-slate-900">{stats.thisWeek.toFixed(1)}h</span>
              </div>
              <Progress value={(stats.thisWeek / 40) * 100} />
              <p className="text-xs text-slate-500">Goal: 40 hours</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Billable</span>
                <span className="font-bold text-slate-900">{stats.billablePercent.toFixed(0)}%</span>
              </div>
              <Progress value={stats.billablePercent} />
              <p className="text-xs text-slate-500">Percentage of weekly hours</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}