import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Loader2, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AITaskSequencer({ projects, tasks, timeEntries }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [sequencing, setSequencing] = useState(null);

    const analyzeTaskSequencing = async (project) => {
        setIsAnalyzing(true);
        setSelectedProject(project);
        
        try {
            const projectTasks = tasks.filter(t => t.project_id === project.id);
            const projectTime = timeEntries.filter(t => t.project_id === project.id);
            
            const tasksWithContext = projectTasks.map(task => ({
                task_id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                estimated_hours: task.estimated_hours,
                priority: task.priority,
                due_date: task.due_date,
                start_date: task.start_date,
                tags: task.tags || [],
                assignee: task.assignee
            }));

            const totalHoursSpent = projectTime.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60;

            const prompt = `You are a construction project scheduling expert. Analyze tasks and predict dependencies to suggest optimal sequencing that minimizes delays.

Project: ${project.name}
Target End Date: ${project.end_date_target || 'Not set'}
Total Hours Spent: ${totalHoursSpent.toFixed(1)}h

Tasks (${projectTasks.length}):
${JSON.stringify(tasksWithContext, null, 2)}

Analyze:
1. Logical dependencies (e.g., foundation before framing, electrical before drywall)
2. Critical path tasks that affect project timeline
3. Tasks that can be parallelized
4. Optimal sequence to minimize delays
5. Resource bottlenecks

Consider construction industry standards and best practices for task sequencing.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        task_dependencies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_id: { type: "string" },
                                    task_title: { type: "string" },
                                    depends_on: { type: "array", items: { type: "string" } },
                                    dependency_reason: { type: "string" }
                                }
                            }
                        },
                        critical_path: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_id: { type: "string" },
                                    task_title: { type: "string" },
                                    sequence_order: { type: "number" },
                                    delay_impact_days: { type: "number" }
                                }
                            }
                        },
                        parallel_opportunities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_group: { type: "array", items: { type: "string" } },
                                    description: { type: "string" },
                                    time_savings: { type: "string" }
                                }
                            }
                        },
                        sequencing_recommendations: { type: "array", items: { type: "string" } },
                        bottleneck_risks: { type: "array", items: { type: "string" } },
                        estimated_completion_date: { type: "string" },
                        optimization_summary: { type: "string" }
                    }
                }
            });

            setSequencing(response);
        } catch (error) {
            console.error('Error analyzing task sequencing:', error);
        }
        setIsAnalyzing(false);
    };

    const getTaskTitle = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        return task?.title || taskId;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-purple-600" />
                    AI Task Sequencer
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!sequencing ? (
                    <div className="space-y-3">
                        <p className="text-slate-600 mb-4">
                            Predict task dependencies and optimize sequencing to minimize delays
                        </p>
                        <div className="space-y-2">
                            {projects.filter(p => p.status === 'active' || p.status === 'planning').map(project => (
                                <div 
                                    key={project.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                                    onClick={() => analyzeTaskSequencing(project)}
                                >
                                    <div>
                                        <div className="font-medium">{project.name}</div>
                                        <div className="text-sm text-slate-600">
                                            {tasks.filter(t => t.project_id === project.id).length} tasks
                                        </div>
                                    </div>
                                    <Button size="sm" disabled={isAnalyzing && selectedProject?.id === project.id}>
                                        {isAnalyzing && selectedProject?.id === project.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Analyze'
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-lg">{selectedProject?.name}</div>
                                <div className="text-sm text-slate-600">Task Dependency Analysis</div>
                            </div>
                            <Button onClick={() => setSequencing(null)} variant="outline" size="sm">
                                Back
                            </Button>
                        </div>

                        {sequencing.optimization_summary && (
                            <Alert className="bg-purple-50 border-purple-200">
                                <AlertDescription>
                                    {sequencing.optimization_summary}
                                </AlertDescription>
                            </Alert>
                        )}

                        {sequencing.estimated_completion_date && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <div className="text-sm text-slate-600">Estimated Completion:</div>
                                <div className="font-bold text-blue-600">
                                    {new Date(sequencing.estimated_completion_date).toLocaleDateString()}
                                </div>
                            </div>
                        )}

                        {sequencing.critical_path?.length > 0 && (
                            <div className="space-y-2">
                                <div className="font-medium text-red-700 flex items-center gap-2">
                                    <Badge variant="destructive">Critical Path</Badge>
                                    <span className="text-sm">High priority - delays impact project</span>
                                </div>
                                <div className="space-y-2">
                                    {sequencing.critical_path
                                        .sort((a, b) => a.sequence_order - b.sequence_order)
                                        .map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-red-50 p-3 rounded border border-red-200">
                                            <Badge variant="outline" className="shrink-0">#{item.sequence_order}</Badge>
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{item.task_title}</div>
                                                <div className="text-xs text-slate-600">
                                                    Delay impact: +{item.delay_impact_days} days
                                                </div>
                                            </div>
                                            {idx < sequencing.critical_path.length - 1 && (
                                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sequencing.task_dependencies?.length > 0 && (
                            <div className="space-y-2">
                                <div className="font-medium text-slate-900">Task Dependencies:</div>
                                {sequencing.task_dependencies.map((dep, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded border">
                                        <div className="font-medium text-sm mb-2">{dep.task_title}</div>
                                        {dep.depends_on?.length > 0 ? (
                                            <div className="space-y-1">
                                                <div className="text-xs text-slate-600">Depends on:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {dep.depends_on.map((depId, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {getTaskTitle(depId)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-slate-600 mt-2">{dep.dependency_reason}</div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-green-600">✓ No dependencies - can start anytime</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {sequencing.parallel_opportunities?.length > 0 && (
                            <div className="space-y-2">
                                <div className="font-medium text-green-700">Parallelization Opportunities:</div>
                                {sequencing.parallel_opportunities.map((opp, idx) => (
                                    <div key={idx} className="bg-green-50 p-3 rounded border border-green-200">
                                        <div className="text-sm font-medium mb-1">{opp.description}</div>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {opp.task_group.map((taskId, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {getTaskTitle(taskId)}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="text-xs text-green-700">⚡ Time savings: {opp.time_savings}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {sequencing.bottleneck_risks?.length > 0 && (
                            <div className="space-y-2">
                                <div className="font-medium text-orange-700">Bottleneck Risks:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1 bg-orange-50 p-3 rounded border border-orange-200">
                                    {sequencing.bottleneck_risks.map((risk, idx) => (
                                        <li key={idx}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {sequencing.sequencing_recommendations?.length > 0 && (
                            <div className="space-y-2">
                                <div className="font-medium text-slate-700">Recommendations:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {sequencing.sequencing_recommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}