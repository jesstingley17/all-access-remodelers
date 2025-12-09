import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock } from 'lucide-react';

export default function ProjectFinancialsCard({ project, timeEntries }) {
  const actualHours = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60;
  
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5"/>Financials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Project Budget</span>
          <span className="text-lg font-bold text-slate-900">${project.budget?.toLocaleString() || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Estimated Hours</span>
          <span className="font-bold text-slate-900">{project.estimated_hours || 'N/A'}h</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <span className="text-sm font-medium text-slate-700">Actual Hours Logged</span>
          <span className="text-lg font-bold text-emerald-600">{actualHours.toFixed(1)}h</span>
        </div>
      </CardContent>
    </Card>
  );
}