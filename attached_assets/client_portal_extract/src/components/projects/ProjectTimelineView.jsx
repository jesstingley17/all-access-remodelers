import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProjectTimelineView({ projects }) {
    const projectsWithDates = projects
        .filter(p => p.due_date)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-emerald-100 text-emerald-800',
            planning: 'bg-amber-100 text-amber-800',
            completed: 'bg-purple-100 text-purple-800',
            on_hold: 'bg-slate-100 text-slate-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-blue-100 text-blue-800';
    };

    const getDaysUntil = (dueDate) => {
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getUrgencyColor = (days) => {
        if (days < 0) return 'text-red-600 bg-red-50';
        if (days <= 7) return 'text-orange-600 bg-orange-50';
        if (days <= 30) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Project Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {projectsWithDates.length > 0 ? (
                        projectsWithDates.map((project) => {
                            const daysUntil = getDaysUntil(project.due_date);
                            return (
                                <Link
                                    key={project.id}
                                    to={createPageUrl('ProjectDetail') + `?id=${project.id}`}
                                    className="block"
                                >
                                    <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                                        <div className={`flex-shrink-0 w-16 h-16 ${getUrgencyColor(daysUntil)} rounded-lg flex flex-col items-center justify-center`}>
                                            <div className="text-2xl font-bold">{Math.abs(daysUntil)}</div>
                                            <div className="text-xs">{daysUntil < 0 ? 'overdue' : 'days'}</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="font-semibold text-slate-900 truncate">{project.title}</h4>
                                                <Badge className={getStatusColor(project.status)}>
                                                    {project.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
                                                </div>
                                                {project.estimated_hours && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{project.estimated_hours}h</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            No projects with due dates
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}