import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Loader2, Award } from 'lucide-react';

export default function AISubcontractorMatcher({ tasks, subcontractors }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [matches, setMatches] = useState(null);

    const findMatches = async () => {
        setIsAnalyzing(true);
        try {
            const unassignedTasks = tasks.filter(t => !t.assignee && t.status !== 'completed');

            const prompt = `You are a construction project manager expert at matching subcontractors to tasks. Analyze tasks and subcontractors to suggest optimal assignments.

Unassigned Tasks (${unassignedTasks.length}):
${JSON.stringify(unassignedTasks.map(t => ({
    task_id: t.id,
    title: t.title,
    description: t.description,
    required_skills: t.tags || [],
    estimated_hours: t.estimated_hours,
    priority: t.priority,
    due_date: t.due_date
})), null, 2)}

Available Subcontractors (${subcontractors.length}):
${JSON.stringify(subcontractors.map(s => ({
    id: s.id,
    name: s.name,
    specialties: s.specialties,
    hourly_rate: s.hourly_rate,
    rating: s.rating,
    availability: s.availability_status,
    current_workload: s.current_workload_hours
})), null, 2)}

Match subcontractors to tasks based on:
- Specialty alignment with task requirements
- Past performance and ratings
- Current workload and availability
- Cost efficiency
- Timeline constraints`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_id: { type: "string" },
                                    task_title: { type: "string" },
                                    best_match: { type: "string" },
                                    match_score: { type: "number", minimum: 0, maximum: 100 },
                                    reasoning: { type: "string" },
                                    estimated_cost: { type: "number" },
                                    availability_concern: { type: "boolean" },
                                    alternatives: { 
                                        type: "array", 
                                        items: {
                                            type: "object",
                                            properties: {
                                                name: { type: "string" },
                                                score: { type: "number" }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        optimization_notes: { type: "string" }
                    }
                }
            });

            setMatches(response);
        } catch (error) {
            console.error('Error matching subcontractors:', error);
        }
        setIsAnalyzing(false);
    };

    const getSubcontractor = (name) => {
        return subcontractors.find(s => s.name === name);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    AI Subcontractor Matcher
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!matches ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Find optimal subcontractor matches for unassigned tasks
                        </p>
                        <Button onClick={findMatches} disabled={isAnalyzing}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Award className="w-4 h-4 mr-2" />
                                    Find Best Matches
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {matches.optimization_notes && (
                            <div className="bg-purple-50 p-3 rounded border border-purple-200 text-sm">
                                {matches.optimization_notes}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button onClick={findMatches} variant="outline" size="sm">
                                Refresh
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {matches.recommendations?.map((rec, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 rounded-lg border">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 mb-1">
                                                {rec.task_title}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-slate-600" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {rec.best_match}
                                                </span>
                                                {rec.availability_concern && (
                                                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                        Limited Availability
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className="bg-purple-100 text-purple-800">
                                            {rec.match_score}% match
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="text-slate-600">{rec.reasoning}</div>
                                        
                                        {rec.estimated_cost && (
                                            <div className="flex items-center justify-between bg-white p-2 rounded">
                                                <span className="text-slate-600">Estimated Cost:</span>
                                                <span className="font-bold text-green-600">${rec.estimated_cost}</span>
                                            </div>
                                        )}

                                        {rec.alternatives?.length > 0 && (
                                            <div className="pt-2 border-t">
                                                <div className="text-xs font-medium text-slate-700 mb-1">
                                                    Alternative Options:
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {rec.alternatives.map((alt, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {alt.name} ({alt.score}%)
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}