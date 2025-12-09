import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, Clock, User, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnhancedProjectCard({ project, client }) {
    const statusColors = {
        active: 'bg-emerald-100 text-emerald-800',
        planning: 'bg-amber-100 text-amber-800',
        completed: 'bg-purple-100 text-purple-800',
        on_hold: 'bg-slate-100 text-slate-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    const priorityColors = {
        urgent: 'bg-red-100 text-red-800',
        high: 'bg-orange-100 text-orange-800',
        medium: 'bg-blue-100 text-blue-800',
        low: 'bg-slate-100 text-slate-800'
    };

    const getProgress = () => {
        if (project.status === 'completed') return 100;
        if (project.status === 'active') return 60;
        if (project.status === 'planning') return 20;
        return 0;
    };

    const isOverdue = project.due_date && new Date(project.due_date) < new Date() && project.status !== 'completed';

    const getDaysRemaining = () => {
        if (!project.due_date) return null;
        const today = new Date();
        const due = new Date(project.due_date);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const daysRemaining = getDaysRemaining();

    return (
        <Link to={createPageUrl('ProjectDetail') + `?id=${project.id}`}>
            <Card className="hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                        {isOverdue && (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={statusColors[project.status]}>
                            {project.status}
                        </Badge>
                        {project.priority && (
                            <Badge className={priorityColors[project.priority]}>
                                {project.priority}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {project.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                            {project.description}
                        </p>
                    )}

                    <div>
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                            <span>Progress</span>
                            <span className="font-semibold">{getProgress()}%</span>
                        </div>
                        <Progress value={getProgress()} className="h-2" />
                    </div>

                    <div className="space-y-2 text-sm">
                        {client && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <User className="w-4 h-4" />
                                <span>{client.name}</span>
                            </div>
                        )}
                        {project.due_date && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {new Date(project.due_date).toLocaleDateString()}
                                    {daysRemaining !== null && (
                                        <span className={`ml-2 font-semibold ${isOverdue ? 'text-red-600' : daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                                            ({isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`})
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                        {project.budget && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <DollarSign className="w-4 h-4" />
                                <span>${project.budget.toLocaleString()}</span>
                            </div>
                        )}
                        {project.estimated_hours && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>{project.estimated_hours} hours</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}