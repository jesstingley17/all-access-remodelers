import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';

export default function AITaskSuggestions({ projects, tasks, onCreateTask }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const generateSuggestions = async () => {
        setIsGenerating(true);
        try {
            const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');
            const recentTasks = tasks.slice(0, 20);

            const prompt = `You are a project management expert. Analyze these construction/business projects and existing tasks to suggest new, actionable tasks that would add value.

Active Projects (${activeProjects.length}):
${JSON.stringify(activeProjects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    start_date: p.start_date,
    budget: p.budget
})), null, 2)}

Recent Tasks (${recentTasks.length}):
${JSON.stringify(recentTasks.map(t => ({
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    project_id: t.project_id
})), null, 2)}

Generate 5-8 smart task suggestions that:
- Fill gaps in project workflows
- Support project milestones and deliverables
- Include preventive maintenance or quality checks
- Address common overlooked areas (documentation, client communication, safety, etc.)
- Are specific and actionable
- Align with project timelines and priorities`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    project_id: { type: "string" },
                                    priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                                    estimated_hours: { type: "number" },
                                    reasoning: { type: "string" },
                                    category: { type: "string" }
                                }
                            }
                        },
                        overall_insights: { type: "string" }
                    }
                }
            });

            setSuggestions(response);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error generating task suggestions:', error);
        }
        setIsGenerating(false);
    };

    const handleCreateSuggestion = async (suggestion) => {
        const taskData = {
            title: suggestion.title,
            description: suggestion.description,
            project_id: suggestion.project_id,
            priority: suggestion.priority || 'medium',
            estimated_hours: suggestion.estimated_hours,
            status: 'todo'
        };
        
        await onCreateTask(taskData);
        
        // Remove from suggestions
        setSuggestions(prev => ({
            ...prev,
            suggestions: prev.suggestions.filter(s => s.title !== suggestion.title)
        }));
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };
        return colors[priority] || colors.medium;
    };

    if (!showSuggestions) {
        return (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-6 text-center">
                    <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        AI Task Suggestions
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm">
                        Let AI analyze your projects and suggest valuable tasks you might be missing
                    </p>
                    <Button 
                        onClick={generateSuggestions} 
                        disabled={isGenerating || projects.length === 0}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Suggestions...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Get AI Suggestions
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white border-purple-200">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Task Suggestions
                    </CardTitle>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowSuggestions(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestions?.overall_insights && (
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-sm text-slate-700">
                        <strong className="text-purple-900">Insights:</strong> {suggestions.overall_insights}
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">
                        {suggestions?.suggestions?.length || 0} suggestions found
                    </p>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateSuggestions}
                        disabled={isGenerating}
                    >
                        Refresh
                    </Button>
                </div>

                <div className="space-y-3">
                    {suggestions?.suggestions?.map((suggestion, idx) => {
                        const project = projects.find(p => p.id === suggestion.project_id);
                        
                        return (
                            <div key={idx} className="bg-slate-50 p-4 rounded-lg border hover:border-purple-300 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-900 mb-1">
                                            {suggestion.title}
                                        </h4>
                                        {project && (
                                            <Badge variant="outline" className="text-xs mb-2">
                                                {project.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <Badge className={getPriorityColor(suggestion.priority)}>
                                        {suggestion.priority}
                                    </Badge>
                                </div>

                                <p className="text-sm text-slate-600 mb-2">
                                    {suggestion.description}
                                </p>

                                {suggestion.reasoning && (
                                    <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded mb-3">
                                        💡 {suggestion.reasoning}
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        {suggestion.estimated_hours && (
                                            <span>Est: {suggestion.estimated_hours}h</span>
                                        )}
                                        {suggestion.category && (
                                            <Badge variant="secondary" className="text-xs">
                                                {suggestion.category}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button 
                                        size="sm"
                                        onClick={() => handleCreateSuggestion(suggestion)}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Create Task
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}