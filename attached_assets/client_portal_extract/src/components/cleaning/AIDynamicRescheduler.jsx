import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';

export default function AIDynamicRescheduler({ jobs, locations, services, onRefresh }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState(null);

    const analyzeScheduleConflicts = async () => {
        setIsAnalyzing(true);
        try {
            const jobsWithContext = jobs.map(job => {
                const location = locations.find(l => l.id === job.client_location_id);
                const service = services.find(s => s.id === job.service_type_id);
                return {
                    job_id: job.id,
                    scheduled_time: job.scheduled_start_at,
                    duration: service?.default_duration_minutes || 60,
                    location: `${location?.city}, ${location?.address_line1}`,
                    status: job.status,
                    assigned_cleaners: job.assigned_cleaners || [],
                    client_id: job.client_id
                };
            });

            const prompt = `You are a cleaning operations scheduling expert. Analyze the current schedule to identify conflicts, overloaded time slots, and suggest optimal rescheduling.

Current Schedule (${jobs.length} jobs):
${JSON.stringify(jobsWithContext, null, 2)}

Today's date: ${new Date().toLocaleDateString()}

Identify issues:
- Time conflicts (overlapping jobs for same cleaner)
- Overloaded schedules
- Inefficient routing (jobs far apart scheduled back-to-back)
- Jobs scheduled too close together without travel time buffer
- Opportunities to optimize by grouping jobs in same area

Suggest rescheduling to maximize efficiency and avoid conflicts.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        conflicts_detected: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    job_ids: { type: "array", items: { type: "string" } },
                                    conflict_type: { type: "string" },
                                    severity: { type: "string", enum: ["low", "medium", "high"] },
                                    description: { type: "string" }
                                }
                            }
                        },
                        rescheduling_suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    job_id: { type: "string" },
                                    current_time: { type: "string" },
                                    suggested_time: { type: "string" },
                                    reason: { type: "string" },
                                    impact: { type: "string" },
                                    priority: { type: "number", minimum: 1, maximum: 10 }
                                }
                            }
                        },
                        efficiency_improvements: { type: "string" },
                        schedule_health_score: { type: "number", minimum: 0, maximum: 100 }
                    }
                }
            });

            setSuggestions(response);
        } catch (error) {
            console.error('Error analyzing schedule:', error);
        }
        setIsAnalyzing(false);
    };

    const applyRescheduling = async (jobId, newTime) => {
        try {
            await base44.entities.CleaningJob.update(jobId, {
                scheduled_start_at: newTime
            });
            onRefresh();
            setSuggestions(null);
        } catch (error) {
            console.error('Error rescheduling job:', error);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-amber-100 text-amber-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[severity] || 'bg-slate-100 text-slate-800';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    AI Dynamic Rescheduler
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!suggestions ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Analyze schedule for conflicts and get intelligent rescheduling suggestions
                        </p>
                        <Button onClick={analyzeScheduleConflicts} disabled={isAnalyzing}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Analyze Schedule
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className={`p-3 rounded-lg ${
                            suggestions.schedule_health_score >= 80 ? 'bg-green-50 border border-green-200' :
                            suggestions.schedule_health_score >= 60 ? 'bg-amber-50 border border-amber-200' :
                            'bg-red-50 border border-red-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Schedule Health: {suggestions.schedule_health_score}%</span>
                                <Button onClick={analyzeScheduleConflicts} variant="outline" size="sm">
                                    Refresh
                                </Button>
                            </div>
                            {suggestions.efficiency_improvements && (
                                <p className="text-sm mt-2">{suggestions.efficiency_improvements}</p>
                            )}
                        </div>

                        {suggestions.conflicts_detected?.length > 0 && (
                            <div className="space-y-2">
                                <div className="font-medium text-slate-900">Conflicts Detected:</div>
                                {suggestions.conflicts_detected.map((conflict, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded border">
                                        <div className="flex items-start justify-between mb-1">
                                            <span className="font-medium text-sm">{conflict.conflict_type}</span>
                                            <Badge className={getSeverityColor(conflict.severity)}>
                                                {conflict.severity}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600">{conflict.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {suggestions.rescheduling_suggestions?.length > 0 ? (
                            <div className="space-y-2">
                                <div className="font-medium text-slate-900">Rescheduling Suggestions:</div>
                                {suggestions.rescheduling_suggestions
                                    .sort((a, b) => b.priority - a.priority)
                                    .map((suggestion, idx) => (
                                    <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">Job ID: {suggestion.job_id}</div>
                                                <div className="text-xs text-slate-600 mt-1">
                                                    {new Date(suggestion.current_time).toLocaleString()} → {new Date(suggestion.suggested_time).toLocaleString()}
                                                </div>
                                            </div>
                                            <Badge variant="outline">Priority: {suggestion.priority}/10</Badge>
                                        </div>
                                        <p className="text-sm text-slate-700 mb-2">{suggestion.reason}</p>
                                        <div className="text-xs text-slate-600 mb-3 bg-white p-2 rounded">
                                            Impact: {suggestion.impact}
                                        </div>
                                        <Button 
                                            size="sm" 
                                            onClick={() => applyRescheduling(suggestion.job_id, suggestion.suggested_time)}
                                            className="w-full"
                                        >
                                            Apply Rescheduling
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-green-600">
                                ✓ No rescheduling needed - schedule is optimal
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}