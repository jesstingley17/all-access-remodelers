import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function ProductivityHeatmap({ timeEntries, isLoading }) {
  const processData = () => {
    const heatmapData = Array(7).fill(0).map(() => Array(24).fill(0));
    
    timeEntries.forEach(entry => {
      const start = new Date(entry.start_time);
      const day = start.getDay();
      const hour = start.getHours();
      heatmapData[day][hour] += entry.duration_minutes;
    });

    return heatmapData;
  };

  const data = processData();
  const maxMinutes = Math.max(...data.flat(), 1);

  const getColor = (minutes) => {
    if (minutes === 0) return 'bg-slate-100';
    const intensity = Math.min(minutes / 60, 1); // Capped at 1 hour for full color
    if (intensity > 0.75) return 'bg-emerald-600';
    if (intensity > 0.5) return 'bg-emerald-500';
    if (intensity > 0.25) return 'bg-emerald-400';
    return 'bg-emerald-300';
  };
  
  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 text-xs text-slate-500 pt-5">
          {DAYS.map(day => <div key={day} className="h-5 flex items-center">{day}</div>)}
        </div>
        <div className="flex-1">
          <div className="flex gap-1 text-xs text-slate-500">
            {HOURS.map(hour => <div key={hour} className="w-5 text-center">{hour.split(':')[0]}</div>).filter((_, i) => i % 2 === 0)}
          </div>
          <div className="flex flex-col gap-1 mt-1">
            {data.map((dayData, dayIndex) => (
              <div key={dayIndex} className="flex gap-1">
                {dayData.map((minutes, hourIndex) => (
                  <div 
                    key={hourIndex} 
                    className={`w-5 h-5 rounded-sm ${getColor(minutes)}`}
                    title={`${DAYS[dayIndex]}, ${HOURS[hourIndex]}: ${minutes.toFixed(0)} mins`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}