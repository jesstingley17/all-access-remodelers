import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AIProjectRiskPredictor({ projects, tasks, timeEntries }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [riskPrediction, setRiskPrediction] = useState(null);
    const [projectFeedback, setProjectFeedback] = useState([]);

    const predictRisk = async (project) => {
        setIsAnalyzing(true);
        setSelectedProject(project);
        
        try {
            // Load historical feedback for this project type
            const feedback = await base44.entities.ProjectFeedback.list();
            setProjectFeedback(feedback);

            const projectTasks = tasks.filter(t => t.project_id === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            const totalTasks = projectTasks.length;
            const overdueTasks = projectTasks.filter(t => 
                t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
            ).length;

            const projectTime = timeEntries.filter(t => t.project_id === project.id);
            const totalHoursSpent = projectTime.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60;

            const daysUntilDeadline = project.end_date_target 
                ? Math.ceil((new Date(project.end_date_target) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

            const avgFeedbackScore = feedback.length > 0
                ? (feedback.reduce((sum, f) => sum + (f.overall_satisfaction || 0), 0) / feedback.length).toFixed(1)
                : null;

            const historicalIssues = feedback.length > 0
                ? [...new Set(feedback.flatMap(f => f.areas_for_improvement || []))]
                : [];

            const prompt = `You are a construction project risk analyst. Predict potential delays and budget overruns for this project.

Historical Performance Data (${feedback.length} past projects):
${feedback.length > 0 ? `
- Average client satisfaction: ${avgFeedbackScore}/5
- Communication rating avg: ${(feedback.reduce((sum, f) => sum + (f.communication_rating || 0), 0) / feedback.length).toFixed(1)}/5
- Timeline rating avg: ${(feedback.reduce((sum, f) => sum + (f.timeline_rating || 0), 0) / feedback.length).toFixed(1)}/5
- Budget rating avg: ${(feedback.reduce((sum, f) => sum + (f.budget_rating || 0), 0) / feedback.length).toFixed(1)}/5
- Common improvement areas: ${historicalIssues.join(', ')}
` : 'No historical feedback data available'}

Predict potential delays and budget overruns for this project, considering historical patterns.

Project: ${project.name}
Status: ${project.status}
Budget: $${project.budget || 'Not set'}
Start Date: ${project.start_date}
Target End Date: ${project.end_date_target || 'Not set'}
Days Until Deadline: ${daysUntilDeadline}

Progress Metrics:
- Total Tasks: ${totalTasks}
- Completed: ${completedTasks} (${totalTasks > 0 ? ((completedTasks/totalTasks)*100).toFixed(1) : 0}%)
- Overdue: ${overdueTasks}
- Hours Spent: ${totalHoursSpent.toFixed(1)}h

Analyze current project health and predict risks considering:
- Schedule adherence
- Task completion rate
- Resource utilization
- Industry standards for project delays
- Weather and seasonal factors (current date: ${new Date().toLocaleDateString()})`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                        delay_probability: { type: "number", minimum: 0, maximum: 100 },
                        budget_overrun_probability: { type: "number", minimum: 0, maximum: 100 },
                        predicted_delay_days: { type: "number" },
                        predicted_budget_overrun_percentage: { type: "number" },
                        key_risk_factors: { type: "array", items: { type: "string" } },
                        mitigation_strategies: { type: "array", items: { type: "string" } },
                        bottlenecks: { type: "array", items: { type: "string" } },
                        health_score: { type: "number", minimum: 0, maximum: 100 },
                        recommendations: { type: "string" }
                    }
                }
            });

            setRiskPrediction(response);
        } catch (error) {
            console.error('Error predicting risk:', error);
        }
        setIsAnalyzing(false);
    };

    const getRiskColor = (level) => {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-amber-100 text-amber-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[level] || 'bg-slate-100 text-slate-800';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    AI Project Risk Predictor
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!riskPrediction ? (
                    <div className="space-y-3">
                        <p className="text-slate-600 mb-4">
                            Select a project to analyze risk of delays and budget overruns
                        </p>
                        <div className="space-y-2">
                            {projects.filter(p => p.status === 'active' || p.status === 'planning').map(project => (
                                <div 
                                    key={project.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                                    onClick={() => predictRisk(project)}
                                >
                                    <div>
                                        <div className="font-medium">{project.name}</div>
                                        <div className="text-sm text-slate-600">{project.code}</div>
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
                                <div className="text-sm text-slate-600">{selectedProject?.code}</div>
                            </div>
                            <Button onClick={() => setRiskPrediction(null)} variant="outline" size="sm">
                                Back
                            </Button>
                        </div>

                        <Alert className={
                            riskPrediction.overall_risk_level === 'critical' ? 'bg-red-50 border-red-200' :
                            riskPrediction.overall_risk_level === 'high' ? 'bg-orange-50 border-orange-200' :
                            riskPrediction.overall_risk_level === 'medium' ? 'bg-amber-50 border-amber-200' :
                            'bg-green-50 border-green-200'
                        }>
                            <AlertDescription>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Overall Risk Level</span>
                                    <Badge className={getRiskColor(riskPrediction.overall_risk_level)}>
                                        {riskPrediction.overall_risk_level}
                                    </Badge>
                                </div>
                                <div className="text-sm">Health Score: {riskPrediction.health_score}%</div>
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <div className="text-sm text-slate-600 mb-1">Delay Probability</div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {riskPrediction.delay_probability}%
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    ~{riskPrediction.predicted_delay_days} days
                                </div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="text-sm text-slate-600 mb-1">Budget Overrun Risk</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {riskPrediction.budget_overrun_probability}%
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    ~{riskPrediction.predicted_budget_overrun_percentage}% over
                                </div>
                            </div>
                        </div>

                        {riskPrediction.key_risk_factors?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Key Risk Factors:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {riskPrediction.key_risk_factors.map((factor, idx) => (
                                        <li key={idx}>{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {riskPrediction.bottlenecks?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Identified Bottlenecks:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {riskPrediction.bottlenecks.map((bottleneck, idx) => (
                                        <li key={idx}>{bottleneck}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {riskPrediction.mitigation_strategies?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Mitigation Strategies:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {riskPrediction.mitigation_strategies.map((strategy, idx) => (
                                        <li key={idx}>{strategy}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {riskPrediction.recommendations && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <div className="text-sm font-medium text-slate-700 mb-1">Recommendations:</div>
                                <div className="text-sm text-slate-600">{riskPrediction.recommendations}</div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}