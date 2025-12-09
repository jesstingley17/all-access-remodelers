import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Calendar, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export default function ProjectDashboardStats({ projects }) {
    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        planning: projects.filter(p => p.status === 'planning').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on_hold').length,
        overdue: projects.filter(p => {
            if (!p.due_date || p.status === 'completed') return false;
            return new Date(p.due_date) < new Date();
        }).length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        totalHours: projects.reduce((sum, p) => sum + (p.estimated_hours || 0), 0),
        avgProgress: projects.length > 0 
            ? Math.round(projects.filter(p => p.status === 'completed').length / projects.length * 100)
            : 0
    };

    const statCards = [
        { title: 'Total Projects', value: stats.total, icon: FolderOpen, color: 'blue', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
        { title: 'Active', value: stats.active, icon: TrendingUp, color: 'emerald', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { title: 'Planning', value: stats.planning, icon: Calendar, color: 'amber', bgColor: 'bg-amber-100', iconColor: 'text-amber-600' },
        { title: 'Completed', value: stats.completed, icon: FolderOpen, color: 'purple', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
        { title: 'On Hold', value: stats.onHold, icon: Clock, color: 'slate', bgColor: 'bg-slate-100', iconColor: 'text-slate-600' },
        { title: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'red', bgColor: 'bg-red-100', iconColor: 'text-red-600' },
        { title: 'Total Budget', value: `$${stats.totalBudget.toLocaleString()}`, icon: DollarSign, color: 'green', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
        { title: 'Est. Hours', value: `${stats.totalHours}h`, icon: Clock, color: 'indigo', bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {statCards.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-2xl font-bold text-slate-900 truncate">{stat.value}</div>
                                <div className="text-xs text-slate-600 truncate">{stat.title}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}