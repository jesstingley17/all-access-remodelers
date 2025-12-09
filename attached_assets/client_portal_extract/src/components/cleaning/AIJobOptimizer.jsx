import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, MapPin, Clock, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AIJobOptimizer({ jobs, clients, locations, services, onRefresh }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recommendations, setRecommendations] = useState(null);

    const optimizeSchedule = async () => {
        setIsAnalyzing(true);
        try {
            const unassignedJobs = jobs.filter(j => !j.assigned_cleaners || j.assigned_cleaners.length === 0);
            
            const jobsContext = unassignedJobs.map(job => {
                const location = locations.find(l => l.id === job.client_location_id);
                const service = services.find(s => s.id === job.service_type_id);
                return {
                    job_id: job.id,
                    location: location?.address_line1 || 'Unknown',
                    city: location?.city,
                    service: service?.name,
                    duration: service?.default_duration_minutes,
                    scheduled_time: job.scheduled_start_at
                };
            });

            const teamMembers = await base44.entities.User.list();

            const prompt = `You are an expert cleaning operations manager. Optimize job scheduling and cleaner assignments for maximum efficiency.

Jobs to Schedule (${unassignedJobs.length}):
${JSON.stringify(jobsContext, null, 2)}

Available Team Members:
${JSON.stringify(teamMembers.map(m => ({
    email: m.email,
    name: m.full_name,
    skills: m.skills || [],
    availability_hours: m.availability_hours_per_week
})), null, 2)}

Provide optimal cleaner assignments considering:
- Geographic proximity (group jobs by area)
- Service type expertise
- Time efficiency (minimize travel time)
- Workload balance
- Job duration and scheduling conflicts`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        assignments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    job_id: { type: "string" },
                                    recommended_cleaner: { type: "string" },
                                    match_score: { type: "number", minimum: 0, maximum: 100 },
                                    reasoning: { type: "string" },
                                    estimated_travel_time: { type: "number" },
                                    alternatives: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        efficiency_score: { type: "number", minimum: 0, maximum: 100 },
                        optimization_notes: { type: "string" }
                    }
                }
            });

            setRecommendations(response);
        } catch (error) {
            console.error('Error optimizing schedule:', error);
        }
        setIsAnalyzing(false);
    };

    const applyAssignment = async (jobId, cleanerEmail) => {
        try {
            const job = jobs.find(j => j.id === jobId);
            await base44.entities.CleaningJob.update(jobId, {
                assigned_cleaners: [...(job.assigned_cleaners || []), cleanerEmail]
            });
            onRefresh();
        } catch (error) {
            console.error('Error applying assignment:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Schedule Optimizer
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!recommendations ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Analyze unassigned jobs and get AI-powered cleaner assignments
                        </p>
                        <Button onClick={optimizeSchedule} disabled={isAnalyzing}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Optimize Schedule
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Alert className="bg-purple-50 border-purple-200">
                            <AlertDescription>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Efficiency Score: {recommendations.efficiency_score}%</span>
                                    <Button onClick={optimizeSchedule} variant="outline" size="sm">
                                        Refresh
                                    </Button>
                                </div>
                                <p className="text-sm mt-2">{recommendations.optimization_notes}</p>
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                            {recommendations.assignments?.map((assignment, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 rounded-lg border">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900">Job ID: {assignment.job_id}</div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                                <User className="w-4 h-4" />
                                                {assignment.recommended_cleaner}
                                            </div>
                                        </div>
                                        <Badge className="bg-purple-100 text-purple-800">
                                            {assignment.match_score}% match
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{assignment.reasoning}</p>
                                    {assignment.estimated_travel_time && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                            <Clock className="w-3 h-3" />
                                            Est. travel: {assignment.estimated_travel_time} min
                                        </div>
                                    )}
                                    <Button 
                                        size="sm" 
                                        onClick={() => applyAssignment(assignment.job_id, assignment.recommended_cleaner)}
                                        className="w-full"
                                    >
                                        Assign Cleaner
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}