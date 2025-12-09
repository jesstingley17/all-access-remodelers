import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AITaskEstimator({ projects }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [estimation, setEstimation] = useState(null);
    const [formData, setFormData] = useState({
        task_title: '',
        task_description: '',
        project_id: '',
        complexity: 'medium',
        required_skills: ''
    });

    const estimateTask = async () => {
        if (!formData.task_title) return;
        
        setIsAnalyzing(true);
        try {
            const project = projects.find(p => p.id === formData.project_id);
            const projectContext = project ? `${project.name}: ${project.description || ''}` : '';

            const prompt = `You are an expert construction project estimator. Provide accurate time and cost estimates for a construction task.

Task: ${formData.task_title}
Description: ${formData.task_description}
Project Context: ${projectContext}
Complexity: ${formData.complexity}
Required Skills: ${formData.required_skills}

Analyze current construction industry standards and provide realistic estimates considering:
- Labor costs and time
- Material requirements
- Equipment needs
- Complexity factors
- Industry benchmarks for similar tasks`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        estimated_hours: { type: "number" },
                        hours_range_low: { type: "number" },
                        hours_range_high: { type: "number" },
                        estimated_cost: { type: "number" },
                        cost_range_low: { type: "number" },
                        cost_range_high: { type: "number" },
                        labor_hours: { type: "number" },
                        material_cost_estimate: { type: "number" },
                        equipment_cost_estimate: { type: "number" },
                        cost_breakdown: { type: "array", items: { type: "string" } },
                        risk_factors: { type: "array", items: { type: "string" } },
                        confidence_level: { type: "string", enum: ["low", "medium", "high"] },
                        recommendations: { type: "string" }
                    }
                }
            });

            setEstimation(response);
        } catch (error) {
            console.error('Error estimating task:', error);
        }
        setIsAnalyzing(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    AI Task Estimator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Task Title *</Label>
                        <Input
                            value={formData.task_title}
                            onChange={(e) => setFormData({...formData, task_title: e.target.value})}
                            placeholder="e.g., Install drywall in master bedroom"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.task_description}
                            onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                            placeholder="Provide details about the task..."
                            className="h-20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Project (optional)</Label>
                        <Select value={formData.project_id} onValueChange={(value) => setFormData({...formData, project_id: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(project => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Complexity</Label>
                        <Select value={formData.complexity} onValueChange={(value) => setFormData({...formData, complexity: value})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Required Skills</Label>
                        <Input
                            value={formData.required_skills}
                            onChange={(e) => setFormData({...formData, required_skills: e.target.value})}
                            placeholder="e.g., Drywall installation, Electrical"
                        />
                    </div>

                    <Button 
                        onClick={estimateTask} 
                        disabled={isAnalyzing || !formData.task_title}
                        className="w-full"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Estimate Task
                            </>
                        )}
                    </Button>
                </div>

                {estimation && (
                    <div className="space-y-3 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-slate-600 mb-1">Estimated Hours</div>
                                <div className="text-3xl font-bold text-blue-600">
                                    {estimation.estimated_hours}h
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Range: {estimation.hours_range_low}-{estimation.hours_range_high}h
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-slate-600 mb-1">Estimated Cost</div>
                                <div className="text-3xl font-bold text-green-600">
                                    ${estimation.estimated_cost}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Range: ${estimation.cost_range_low}-${estimation.cost_range_high}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="bg-slate-50 p-3 rounded">
                                <div className="text-slate-600">Labor</div>
                                <div className="font-bold">{estimation.labor_hours}h</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded">
                                <div className="text-slate-600">Materials</div>
                                <div className="font-bold">${estimation.material_cost_estimate}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded">
                                <div className="text-slate-600">Equipment</div>
                                <div className="font-bold">${estimation.equipment_cost_estimate}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Confidence Level</span>
                            <Badge className="capitalize">{estimation.confidence_level}</Badge>
                        </div>

                        {estimation.cost_breakdown?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Cost Breakdown:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {estimation.cost_breakdown.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {estimation.risk_factors?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Risk Factors:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {estimation.risk_factors.map((factor, idx) => (
                                        <li key={idx}>{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {estimation.recommendations && (
                            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                {estimation.recommendations}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}