import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Target } from "lucide-react";
import { format } from "date-fns";

export default function CalendarHeader({ currentDate, setCurrentDate, view, setView }) {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    if (view === 'day') newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    if (view === 'day') newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getHeaderText = () => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    if (view === 'day') return format(currentDate, 'MMMM d, yyyy');
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handlePrev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={handleNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={handleToday} className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Today
        </Button>
        <h2 className="text-xl font-semibold text-slate-800 ml-4">
          {getHeaderText()}
        </h2>
      </div>
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        <Button 
          variant={view === 'month' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('month')}
        >
          Month
        </Button>
        <Button 
          variant={view === 'week' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('week')}
        >
          Week
        </Button>
        <Button 
          variant={view === 'day' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('day')}
        >
          Day
        </Button>
      </div>
    </div>
  );
}