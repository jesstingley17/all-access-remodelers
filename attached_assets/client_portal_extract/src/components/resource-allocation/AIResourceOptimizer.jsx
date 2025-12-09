import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Users, AlertTriangle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AIResourceOptimizer({ projects, tasks, teamMembers, onRefresh }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const analyzeResources = async () => {
        setIsAnalyzing(true);
        try {
            // Calculate current workload for each team member
            const workloadByMember = {};
            teamMembers.forEach(member => {
                const memberTasks = tasks.filter(t => 
                    t.assignee === member.email && 
                    t.status !== 'completed'
                );
                const totalHours = memberTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
                workloadByMember[member.email] = {
                    current_hours: totalHours,
                    available_hours: member.availability_hours_per_week || 40,
                    utilization: (totalHours / (member.availability_hours_per_week || 40)) * 100,
                    tasks: memberTasks.length,
                    skills: member.skills || []
                };
            });

            // Prepare context for AI
            const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');
            const projectContext = activeProjects.map(p => ({
                id: p.id,
                title: p.title,
                type: p.project_type,
                due_date: p.due_date,
                estimated_hours: p.estimated_hours,
                priority: p.priority
            }));

            const unassignedTasks = tasks.filter(t => !t.assignee && t.status !== 'completed');
            const taskContext = unassignedTasks.map(t => ({
                id: t.id,
                title: t.title,
                project_id: t.project_id,
                estimated_hours: t.estimated_hours,
                priority: t.priority,
                due_date: t.due_date,
                tags: t.tags || []
            }));

            const teamContext = teamMembers.map(m => ({
                email: m.email,
                name: m.full_name,
                skills: m.skills || [],
                role: m.job_title,
                ...workloadByMember[m.email]
            }));

            const prompt = `You are an expert resource allocation manager. Analyze this freelance team's workload and project portfolio to optimize resource allocation.

Current Team Workload:
${JSON.stringify(teamContext, null, 2)}

Active Projects:
${JSON.stringify(projectContext, null, 2)}

Unassigned Tasks (${unassignedTasks.length}):
${JSON.stringify(taskContext, null, 2)}

Provide comprehensive resource optimization recommendations considering:
1. Team member skills and expertise
2. Current workload and capacity
3. Project priorities and deadlines
4. Potential bottlenecks and conflicts
5. Optimal task assignments for efficiency

Use current project management best practices and workforce optimization strategies.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_health: {
                            type: "string",
                            enum: ["healthy", "attention_needed", "critical"]
                        },
                        team_utilization_score: {
                            type: "number",
                            minimum: 0,
                            maximum: 100
                        },
                        bottlenecks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    severity: { type: "string", enum: ["low", "medium", "high"] },
                                    description: { type: "string" },
                                    affected_projects: { type: "array", items: { type: "string" } },
                                    recommendation: { type: "string" }
                                }
                            }
                        },
                        overloaded_members: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    email: { type: "string" },
                                    current_load: { type: "number" },
                                    recommendation: { type: "string" }
                                }
                            }
                        },
                        underutilized_members: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    email: { type: "string" },
                                    capacity: { type: "number" },
                                    suggested_tasks: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        task_assignments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_id: { type: "string" },
                                    recommended_assignee: { type: "string" },
                                    match_score: { type: "number", minimum: 0, maximum: 100 },
                                    reasoning: { type: "string" },
                                    alternative_assignees: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        reallocation_suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_id: { type: "string" },
                                    current_assignee: { type: "string" },
                                    suggested_assignee: { type: "string" },
                                    reason: { type: "string" },
                                    impact: { type: "string" }
                                }
                            }
                        },
                        timeline_risks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    project_id: { type: "string" },
                                    risk_level: { type: "string", enum: ["low", "medium", "high"] },
                                    description: { type: "string" },
                                    mitigation: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setAnalysis({ ...response, workloadByMember });
        } catch (error) {
            console.error('Error analyzing resources:', error);
        }
        setIsAnalyzing(false);
    };

    const getHealthColor = (health) => {
        const colors = {
            healthy: 'text-emerald-600 bg-emerald-100',
            attention_needed: 'text-amber-600 bg-amber-100',
            critical: 'text-red-600 bg-red-100'
        };
        return colors[health] || colors.attention_needed;
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-amber-100 text-amber-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[severity] || colors.medium;
    };

    const getMemberName = (email) => {
        const member = teamMembers.find(m => m.email === email);
        return member?.full_name || email;
    };

    const getTaskTitle = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        return task?.title || 'Unknown Task';
    };

    const getProjectTitle = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project?.title || 'Unknown Project';
    };

    if (!analysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Resource Optimizer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-slate-600 mb-4">
                            Analyze your team's workload, identify bottlenecks, and get intelligent task assignment recommendations
                        </p>
                        <Button onClick={analyzeResources} disabled={isAnalyzing} size="lg">
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing Resources...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Run Resource Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className={`border-2 ${analysis.overall_health === 'healthy' ? 'border-emerald-200' : analysis.overall_health === 'critical' ? 'border-red-200' : 'border-amber-200'}`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Resource Health Overview
                        </CardTitle>
                        <Button onClick={analyzeResources} disabled={isAnalyzing} variant="outline" size="sm">
                            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-slate-600 mb-1">Overall Health</div>
                            <Badge className={`${getHealthColor(analysis.overall_health)} text-lg px-3 py-1`}>
                                {analysis.overall_health.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <div className="text-sm text-slate-600 mb-2">Team Utilization</div>
                            <div className="flex items-center gap-3">
                                <Progress value={analysis.team_utilization_score} className="flex-1" />
                                <span className="font-bold text-slate-900">{analysis.team_utilization_score}%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Accordion type="multiple" className="space-y-4">
                {analysis.bottlenecks?.length > 0 && (
                    <AccordionItem value="bottlenecks">
                        <Card>
                            <AccordionTrigger className="px-6 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    <span className="font-semibold">Bottlenecks Detected ({analysis.bottlenecks.length})</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <CardContent className="space-y-3">
                                    {analysis.bottlenecks.map((bottleneck, idx) => (
                                        <Alert key={idx} className="border-l-4 border-l-red-500">
                                            <AlertDescription>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold">{bottleneck.type}</span>
                                                        <Badge className={getSeverityColor(bottleneck.severity)}>
                                                            {bottleneck.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm">{bottleneck.description}</p>
                                                    {bottleneck.affected_projects?.length > 0 && (
                                                        <div className="text-xs text-slate-600">
                                                            Affects: {bottleneck.affected_projects.map(pid => getProjectTitle(pid)).join(', ')}
                                                        </div>
                                                    )}
                                                    <div className="bg-blue-50 p-2 rounded text-sm">
                                                        <strong>Recommendation:</strong> {bottleneck.recommendation}
                                                    </div>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                )}

                {(analysis.overloaded_members?.length > 0 || analysis.underutilized_members?.length > 0) && (
                    <AccordionItem value="workload">
                        <Card>
                            <AccordionTrigger className="px-6 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold">Team Workload Balance</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <CardContent className="space-y-4">
                                    {analysis.overloaded_members?.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-red-600 mb-2">Overloaded Members</h4>
                                            {analysis.overloaded_members.map((member, idx) => (
                                                <Alert key={idx} className="mb-2">
                                                    <AlertDescription>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">{getMemberName(member.email)}</span>
                                                                <Badge variant="destructive">{member.current_load}h</Badge>
                                                            </div>
                                                            <p className="text-sm">{member.recommendation}</p>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    )}
                                    {analysis.underutilized_members?.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-green-600 mb-2">Available Capacity</h4>
                                            {analysis.underutilized_members.map((member, idx) => (
                                                <Alert key={idx} className="mb-2 border-green-200 bg-green-50">
                                                    <AlertDescription>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">{getMemberName(member.email)}</span>
                                                                <Badge className="bg-green-100 text-green-800">{member.capacity}h available</Badge>
                                                            </div>
                                                            {member.suggested_tasks?.length > 0 && (
                                                                <div className="text-sm">
                                                                    Could handle: {member.suggested_tasks.map(tid => getTaskTitle(tid)).join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                )}

                {analysis.task_assignments?.length > 0 && (
                    <AccordionItem value="assignments">
                        <Card>
                            <AccordionTrigger className="px-6 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <span className="font-semibold">Recommended Task Assignments ({analysis.task_assignments.length})</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <CardContent className="space-y-3">
                                    {analysis.task_assignments.map((assignment, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-900">{getTaskTitle(assignment.task_id)}</div>
                                                    <div className="text-sm text-slate-600 mt-1">→ {getMemberName(assignment.recommended_assignee)}</div>
                                                </div>
                                                <Badge className="bg-purple-100 text-purple-800">
                                                    {assignment.match_score}% match
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{assignment.reasoning}</p>
                                            {assignment.alternative_assignees?.length > 0 && (
                                                <div className="text-xs text-slate-500">
                                                    Alternatives: {assignment.alternative_assignees.map(e => getMemberName(e)).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                )}

                {analysis.timeline_risks?.length > 0 && (
                    <AccordionItem value="risks">
                        <Card>
                            <AccordionTrigger className="px-6 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    <span className="font-semibold">Timeline Risks ({analysis.timeline_risks.length})</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <CardContent className="space-y-3">
                                    {analysis.timeline_risks.map((risk, idx) => (
                                        <Alert key={idx} className={`border-l-4 ${risk.risk_level === 'high' ? 'border-l-red-500' : risk.risk_level === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                                            <AlertDescription>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold">{getProjectTitle(risk.project_id)}</span>
                                                        <Badge className={getSeverityColor(risk.risk_level)}>
                                                            {risk.risk_level} risk
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm">{risk.description}</p>
                                                    <div className="bg-blue-50 p-2 rounded text-sm">
                                                        <strong>Mitigation:</strong> {risk.mitigation}
                                                    </div>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    );
}