
import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay
} from "date-fns";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const eventTypeColors = {
  meeting: 'bg-blue-100 text-blue-800 border-blue-200',
  focus_time: 'bg-purple-100 text-purple-800 border-purple-200',
  deadline: 'bg-red-100 text-red-800 border-red-200',
  personal: 'bg-green-100 text-green-800 border-green-200',
  vacation: 'bg-amber-100 text-amber-800 border-amber-200',
  project: 'bg-slate-100 text-slate-800 border-slate-200',
  task: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

const MonthView = ({ currentDate, events, projects, tasks, onSelectEvent, onSelectSlot }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getItemsForDay = (day) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day)).map(e => ({...e, itemType: e.event_type}));
    const dayProjectDeadlines = projects.filter(p => p.due_date && isSameDay(new Date(p.due_date), day)).map(p => ({...p, itemType: 'project', title: `Project: ${p.title}`}));
    const dayTaskDeadlines = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day)).map(t => ({...t, itemType: 'task', title: `Task: ${t.title}`}));
    
    return [...dayEvents, ...dayProjectDeadlines, ...dayTaskDeadlines];
  };

  return (
    <div className="grid grid-cols-7 flex-1">
      {dayNames.map(day => (
        <div key={day} className="text-center font-medium text-slate-600 text-sm p-2 border-b border-slate-200">
          {day}
        </div>
      ))}
      {days.map((day) => {
        const items = getItemsForDay(day);
        return (
          <div
            key={day.toString()}
            className={`border-r border-b border-slate-200 p-2 min-h-[120px] flex flex-col transition-colors hover:bg-slate-50 ${
              !isSameMonth(day, monthStart) ? 'bg-slate-50/50' : 'bg-white'
            }`}
            onClick={() => onSelectSlot(day)}
          >
            <div
              className={`font-semibold self-start mb-2 ${
                isToday(day) ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-slate-700'
              }`}
            >
              {format(day, 'd')}
            </div>
            <div className="space-y-1 overflow-y-auto">
              {items.slice(0, 3).map((item, index) => (
                <div 
                  key={item.id || index}
                  className={`px-2 py-1 rounded-md text-xs truncate cursor-pointer ${eventTypeColors[item.itemType] || eventTypeColors.personal}`}
                  onClick={(e) => { e.stopPropagation(); onSelectEvent(item); }}
                >
                  {item.title}
                </div>
              ))}
              {items.length > 3 && (
                <div className="text-xs text-slate-500 font-medium">+ {items.length - 3} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


export default function CalendarView({ view, currentDate, events, projects, tasks, isLoading, onSelectEvent, onSelectSlot }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 h-full">
        <CardContent className="p-4">
            <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  const renderView = () => {
    switch (view) {
      case 'month':
        return <MonthView {...{ currentDate, events, projects, tasks, onSelectEvent, onSelectSlot }} />;
      case 'week':
        return <div className="text-center p-8">Week view is not yet implemented.</div>;
      case 'day':
        return <div className="text-center p-8">Day view is not yet implemented.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 flex flex-col h-full">
      {renderView()}
    </div>
  );
}
