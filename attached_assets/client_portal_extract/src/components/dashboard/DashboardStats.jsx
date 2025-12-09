import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DashboardStats({ title, value, icon: Icon, color, trend, isUrgent }) {
  return (
    <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <div className={`absolute top-0 right-0 w-28 h-28 transform translate-x-6 -translate-y-6 rounded-full opacity-10 ${color.replace('text-','bg-')}`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
              {isUrgent && <AlertTriangle className="w-5 h-5 text-red-500" />}
            </div>
            {trend && (
              <div className={`mt-3 text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-slate-600'}`}>{trend}</div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-opacity-15 backdrop-blur-sm ${color.replace('text-','bg-')}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}