import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

export default function ProjectProgress({ projects, onRefresh }) {
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

    const getProgress = (project) => {
        if (project.status === 'completed') return 100;
        if (project.status === 'active') return 60;
        if (project.status === 'planning') return 20;
        return 0;
    };

    if (projects.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <p className="text-slate-500">No projects found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6">
            {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-xl">{project.title}</CardTitle>
                                {project.description && (
                                    <p className="text-sm text-slate-600 mt-2">{project.description}</p>
                                )}
                            </div>
                            <Badge className={getStatusColor(project.status)}>
                                {project.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                                <span>Overall Progress</span>
                                <span className="font-semibold">{getProgress(project)}%</span>
                            </div>
                            <Progress value={getProgress(project)} className="h-3" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {project.start_date && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <div>
                                        <div className="text-xs text-slate-500">Start Date</div>
                                        <div className="font-medium">{new Date(project.start_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                            {project.due_date && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock className="w-4 h-4" />
                                    <div>
                                        <div className="text-xs text-slate-500">Due Date</div>
                                        <div className="font-medium">{new Date(project.due_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                            {project.budget && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <DollarSign className="w-4 h-4" />
                                    <div>
                                        <div className="text-xs text-slate-500">Budget</div>
                                        <div className="font-medium">${project.budget.toLocaleString()}</div>
                                    </div>
                                </div>
                            )}
                            {project.estimated_hours && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <div>
                                        <div className="text-xs text-slate-500">Estimated Hours</div>
                                        <div className="font-medium">{project.estimated_hours}h</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {project.notes && (
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-slate-700 mb-1">Project Notes</div>
                                <div className="text-sm text-slate-600">{project.notes}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}