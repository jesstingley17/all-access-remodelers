import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Loader2, Target, AlertCircle, CheckCircle, Award } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AIStaffPerformanceAnalyzer({ staff, jobs, timeEntries, feedback }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [analysis, setAnalysis] = useState(null);

    const analyzePerformance = async () => {
        if (!selectedStaff) return;

        setIsAnalyzing(true);
        try {
            const staffMember = staff.find(s => s.email === selectedStaff);
            const staffJobs = jobs.filter(j => j.assigned_cleaners?.includes(selectedStaff));
            const staffTime = timeEntries.filter(t => t.staff_email === selectedStaff);
            
            const completedJobs = staffJobs.filter(j => j.status === 'completed');
            const totalJobs = staffJobs.filter(j => j.status !== 'draft').length;
            const completionRate = totalJobs > 0 ? (completedJobs.length / totalJobs) * 100 : 0;

            const staffFeedback = feedback.filter(f => {
                const job = jobs.find(j => j.id === f.job_id);
                return job?.assigned_cleaners?.includes(selectedStaff);
            });
            const avgRating = staffFeedback.length > 0
                ? staffFeedback.reduce((sum, f) => sum + f.rating, 0) / staffFeedback.length
                : 0;

            const lateJobs = staffJobs.filter(j => {
                if (!j.scheduled_start_at || !j.completed_at) return false;
                const scheduled = new Date(j.scheduled_start_at);
                const completed = new Date(j.completed_at);
                const expectedEnd = new Date(scheduled.getTime() + (j.estimated_duration_minutes || 60) * 60000);
                return completed > expectedEnd;
            }).length;
            const scheduleAdherence = totalJobs > 0 ? ((totalJobs - lateJobs) / totalJobs) * 100 : 0;

            const totalHoursWorked = staffTime.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60;
            const last30Days = staffJobs.filter(j => {
                const jobDate = new Date(j.scheduled_start_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return jobDate >= thirtyDaysAgo;
            }).length;

            const negativeFeedback = staffFeedback.filter(f => f.rating <= 3);
            const commonIssues = negativeFeedback.map(f => f.comment).filter(Boolean);

            const prompt = `You are a cleaning business operations expert. Analyze this staff member's performance and provide actionable insights.

Staff Member: ${staffMember?.full_name}
Role: ${staffMember?.staff_role || 'Cleaner'}
Tenure: ${staffMember?.created_date ? Math.floor((new Date() - new Date(staffMember.created_date)) / (1000 * 60 * 60 * 24)) : 0} days

Performance Metrics:
- Total Jobs Assigned: ${totalJobs}
- Completed Jobs: ${completedJobs.length}
- Completion Rate: ${completionRate.toFixed(1)}%
- Average Client Rating: ${avgRating.toFixed(1)}/5 (based on ${staffFeedback.length} reviews)
- Schedule Adherence: ${scheduleAdherence.toFixed(1)}%
- Late Completions: ${lateJobs}
- Total Hours Worked: ${totalHoursWorked.toFixed(1)}h
- Jobs Last 30 Days: ${last30Days}

Client Feedback:
${staffFeedback.length > 0 ? staffFeedback.slice(0, 10).map(f => `- Rating: ${f.rating}/5${f.comment ? ` - "${f.comment}"` : ''}`).join('\n') : 'No feedback yet'}

${commonIssues.length > 0 ? `Common Issues from Negative Feedback:\n${commonIssues.join('\n')}` : ''}

Analyze:
1. Overall performance level (excellent, good, needs improvement, concerning)
2. Key strengths
3. Areas needing improvement
4. Specific training recommendations
5. Actionable performance improvement plan
6. Career development opportunities`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_performance: { type: "string", enum: ["excellent", "good", "needs_improvement", "concerning"] },
                        performance_score: { type: "number", minimum: 0, maximum: 100 },
                        strengths: { type: "array", items: { type: "string" } },
                        areas_for_improvement: { type: "array", items: { type: "string" } },
                        training_recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    topic: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] },
                                    description: { type: "string" },
                                    expected_outcome: { type: "string" }
                                }
                            }
                        },
                        improvement_plan: {
                            type: "object",
                            properties: {
                                short_term_goals: { type: "array", items: { type: "string" } },
                                long_term_goals: { type: "array", items: { type: "string" } },
                                action_steps: { type: "array", items: { type: "string" } },
                                timeline: { type: "string" }
                            }
                        },
                        career_opportunities: { type: "array", items: { type: "string" } },
                        recognition_worthy: { type: "boolean" },
                        red_flags: { type: "array", items: { type: "string" } },
                        summary: { type: "string" }
                    }
                }
            });

            setAnalysis({
                ...response,
                metrics: {
                    completionRate,
                    avgRating,
                    scheduleAdherence,
                    totalHoursWorked,
                    last30Days,
                    totalJobs,
                    completedJobs: completedJobs.length
                },
                staff: staffMember
            });
        } catch (error) {
            console.error('Error analyzing performance:', error);
        }
        setIsAnalyzing(false);
    };

    const getPerformanceColor = (level) => {
        const colors = {
            excellent: 'bg-green-100 text-green-800',
            good: 'bg-blue-100 text-blue-800',
            needs_improvement: 'bg-amber-100 text-amber-800',
            concerning: 'bg-red-100 text-red-800'
        };
        return colors[level] || 'bg-slate-100 text-slate-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-amber-100 text-amber-800',
            low: 'bg-blue-100 text-blue-800'
        };
        return colors[priority] || 'bg-slate-100 text-slate-800';
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    AI Staff Performance Analyzer
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!analysis ? (
                    <div className="space-y-4">
                        <p className="text-slate-600 mb-4">
                            Get AI-powered performance insights and personalized training recommendations
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Staff Member</label>
                            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staff.map(member => (
                                        <SelectItem key={member.email} value={member.email}>
                                            {member.full_name} ({member.staff_role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={analyzePerformance} disabled={!selectedStaff || isAnalyzing} className="w-full">
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing Performance...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Analyze Performance
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-lg">{analysis.staff?.full_name}</div>
                                <div className="text-sm text-slate-600">{analysis.staff?.staff_role}</div>
                            </div>
                            <Button onClick={() => setAnalysis(null)} variant="outline" size="sm">
                                Back
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                            <div>
                                <div className="text-sm text-slate-600 mb-1">Performance Score</div>
                                <div className="text-3xl font-bold text-slate-900">{analysis.performance_score}/100</div>
                            </div>
                            <Badge className={getPerformanceColor(analysis.overall_performance)}>
                                {analysis.overall_performance.replace('_', ' ')}
                            </Badge>
                        </div>

                        {analysis.recognition_worthy && (
                            <Alert className="bg-yellow-50 border-yellow-200">
                                <Award className="w-4 h-4" />
                                <AlertDescription>
                                    <strong>Recognition Worthy!</strong> This team member's performance is exceptional and deserves recognition.
                                </AlertDescription>
                            </Alert>
                        )}

                        {analysis.red_flags?.length > 0 && (
                            <Alert className="bg-red-50 border-red-200">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription>
                                    <div className="font-medium mb-1">Performance Concerns</div>
                                    <ul className="text-sm list-disc list-inside">
                                        {analysis.red_flags.map((flag, idx) => (
                                            <li key={idx}>{flag}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 p-3 rounded border">
                                <div className="text-xs text-slate-600 mb-1">Completion Rate</div>
                                <div className="text-lg font-bold">{analysis.metrics.completionRate.toFixed(1)}%</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border">
                                <div className="text-xs text-slate-600 mb-1">Avg Rating</div>
                                <div className="text-lg font-bold">{analysis.metrics.avgRating.toFixed(1)}/5</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border">
                                <div className="text-xs text-slate-600 mb-1">Schedule Adherence</div>
                                <div className="text-lg font-bold">{analysis.metrics.scheduleAdherence.toFixed(1)}%</div>
                            </div>
                        </div>

                        {analysis.summary && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm text-slate-700">
                                {analysis.summary}
                            </div>
                        )}

                        {analysis.strengths?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-green-700 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Key Strengths
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.strengths.map((strength, idx) => (
                                        <Badge key={idx} className="bg-green-100 text-green-800">
                                            {strength}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.areas_for_improvement?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-amber-700 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Areas for Improvement
                                </div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {analysis.areas_for_improvement.map((area, idx) => (
                                        <li key={idx}>{area}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {analysis.training_recommendations?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Training Recommendations</div>
                                {analysis.training_recommendations.map((training, idx) => (
                                    <div key={idx} className="p-3 bg-purple-50 rounded border border-purple-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-medium text-sm">{training.topic}</div>
                                            <Badge className={getPriorityColor(training.priority)}>
                                                {training.priority} priority
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-slate-700 mb-1">{training.description}</div>
                                        <div className="text-xs text-purple-700">
                                            <strong>Expected Outcome:</strong> {training.expected_outcome}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analysis.improvement_plan && (
                            <div className="space-y-3 p-4 bg-slate-50 rounded border">
                                <div className="font-medium text-slate-900">Performance Improvement Plan</div>
                                
                                {analysis.improvement_plan.short_term_goals?.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-slate-700 mb-1">Short-term Goals (30-60 days)</div>
                                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                            {analysis.improvement_plan.short_term_goals.map((goal, idx) => (
                                                <li key={idx}>{goal}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.improvement_plan.long_term_goals?.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-slate-700 mb-1">Long-term Goals (3-6 months)</div>
                                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                            {analysis.improvement_plan.long_term_goals.map((goal, idx) => (
                                                <li key={idx}>{goal}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.improvement_plan.action_steps?.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-slate-700 mb-1">Action Steps</div>
                                        <ul className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                                            {analysis.improvement_plan.action_steps.map((step, idx) => (
                                                <li key={idx}>{step}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {analysis.career_opportunities?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Career Development Opportunities</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {analysis.career_opportunities.map((opp, idx) => (
                                        <li key={idx}>{opp}</li>
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