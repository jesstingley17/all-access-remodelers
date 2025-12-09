
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added import for Card components
import { InvokeLLM } from "@/api/integrations";
import { ProjectAudit } from "@/api/entities";
import { Task } from "@/api/entities";
import { AlertTriangle, CheckCircle, BrainCircuit, Sparkles, Wand2 } from "lucide-react";

const priorityMap = {
    "Critical": "urgent",
    "High": "high",
    "Medium": "medium",
    "Low": "low"
};

export default function ProjectAuditModal({ project, tasks, timeEntries, isOpen, onClose, onComplete }) {
    const [step, setStep] = useState('input'); // input, loading, result, action_plan
    const [userInputs, setUserInputs] = useState({
        challenges: '',
        team_performance: '',
        client_feedback: ''
    });
    const [analysisResult, setAnalysisResult] = useState(null);
    const [selectedActions, setSelectedActions] = useState([]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setUserInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleRunAnalysis = async () => {
        setStep('loading');

        const actualHours = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60;
        const prompt = `
            You are a world-class management consultant and project recovery expert. Conduct a thorough project review based on the provided data and qualitative feedback.

            **Objective:** Develop a strategic intervention plan to ensure successful project completion, optimize resource use, and align with original goals.

            **Project Data:**
            - Title: ${project.title}
            - Description: ${project.description}
            - Status: ${project.status}
            - Budget: $${project.budget || 0}
            - Estimated Hours: ${project.estimated_hours || 0}
            - Actual Hours Logged: ${actualHours.toFixed(1)}
            - Completion Percentage: ${project.completion_percentage || 0}%
            - Start Date: ${project.start_date}
            - Due Date: ${project.due_date}
            - Total Tasks: ${tasks.length}
            - Completed Tasks: ${tasks.filter(t => t.status === 'completed').length}

            **User's Qualitative Feedback:**
            - Current Challenges & Roadblocks: ${userInputs.challenges || 'Not provided.'}
            - Team Performance & Morale: ${userInputs.team_performance || 'Not provided.'}
            - Recent Client Feedback & Satisfaction: ${userInputs.client_feedback || 'Not provided.'}

            **Your Task:**
            1.  **Analyze Holistically:** Evaluate the project against its original scope, timeline, and budget. Consider technical, operational, and human factors from the provided data.
            2.  **Identify Core Problems:** Pinpoint specific performance gaps, risks, and challenges. Use the data as evidence.
            3.  **Provide Actionable Recommendations:** Create a prioritized list of specific, measurable interventions. These should be concrete actions, not generic advice.
            4.  **Estimate Impact & Effort:** For each recommendation, estimate the effort in hours and describe the potential positive impact.
            5.  **Project Outcomes:** Briefly describe the likely outcome if no action is taken, and the potential outcome if your recommendations are followed.
            6.  **Calculate Health Score:** Provide an overall project health score from 0 (critical failure) to 100 (perfectly on track).
        `;

        try {
            const response = await InvokeLLM({
                prompt,
                add_context_from_internet: true, // For market context if needed
                response_json_schema: {
                    type: "object",
                    properties: {
                        executive_summary: { type: "string", description: "A brief, high-level summary of the project's state and critical findings." },
                        overall_health_score: { type: "number", description: "A score from 0-100 indicating the project's health." },
                        problem_analysis: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    problem: { type: "string", description: "The specific problem or risk identified." },
                                    details: { type: "string", description: "Detailed explanation of the problem." },
                                    data_evidence: { type: "string", description: "Which data point (e.g., 'Budget Overrun', 'Low Completion %') supports this finding." }
                                }
                            }
                        },
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    action: { type: "string", description: "A clear, actionable title for the recommendation (suitable as a task title)." },
                                    description: { type: "string", description: "A detailed description of what needs to be done." },
                                    priority: { type: "string", enum: ["Critical", "High", "Medium", "Low"] },
                                    estimated_effort_hours: { type: "number", description: "Estimated hours to implement this action." },
                                    potential_impact: { type: "string", description: "The expected positive outcome of this action." }
                                }
                            }
                        },
                        projected_outcome_no_change: { type: "string", description: "The likely result if no corrective actions are taken." },
                        projected_outcome_with_change: { type: "string", description: "The potential successful outcome if recommendations are implemented." }
                    },
                    required: ["executive_summary", "overall_health_score", "problem_analysis", "recommendations", "projected_outcome_no_change", "projected_outcome_with_change"]
                }
            });

            const auditRecord = {
                project_id: project.id,
                user_inputs: userInputs,
                ai_analysis: response
            };
            
            await ProjectAudit.create(auditRecord);
            setAnalysisResult(response);
            setSelectedActions(response.recommendations.map((_, index) => index)); // Pre-select all actions
            setStep('result');

        } catch (error) {
            console.error("Error running project audit:", error);
            setStep('input'); // Revert to input on error
        }
    };
    
    const handleCreateTasks = async () => {
        const tasksToCreate = analysisResult.recommendations
            .filter((_, index) => selectedActions.includes(index))
            .map(rec => ({
                title: rec.action,
                description: rec.description,
                project_id: project.id,
                priority: priorityMap[rec.priority] || 'medium',
                estimated_hours: rec.estimated_effort_hours,
                status: 'todo'
            }));

        if (tasksToCreate.length > 0) {
            await Task.bulkCreate(tasksToCreate);
        }
        onComplete();
        onClose();
    };

    const handleActionSelection = (index) => {
        setSelectedActions(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <ScrollArea className="max-h-[90vh]">
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-2xl">
                                <BrainCircuit className="w-7 h-7 mr-2 text-indigo-600"/>
                                Strategic Project Audit
                            </DialogTitle>
                            <DialogDescription>
                                An AI-powered intervention plan to get your project on track.
                            </DialogDescription>
                        </DialogHeader>

                        {step === 'input' && (
                            <div className="mt-6 space-y-4">
                                <p className="text-sm text-slate-600">Provide your qualitative feedback to give the AI context beyond the raw data. The more detail you provide, the better the analysis.</p>
                                <div>
                                    <Label htmlFor="challenges" className="font-semibold">Current Challenges & Roadblocks</Label>
                                    <Textarea id="challenges" value={userInputs.challenges} onChange={handleInputChange} placeholder="e.g., Unclear client requirements, scope creep, technical debt..." className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="team_performance" className="font-semibold">Team Performance & Morale</Label>
                                    <Textarea id="team_performance" value={userInputs.team_performance} onChange={handleInputChange} placeholder="e.g., Team is motivated but overworked, communication issues, key member is a bottleneck..." className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="client_feedback" className="font-semibold">Recent Client Feedback & Satisfaction</Label>
                                    <Textarea id="client_feedback" value={userInputs.client_feedback} onChange={handleInputChange} placeholder="e.g., Client is happy with the design but concerned about the timeline..." className="mt-2" />
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button onClick={handleRunAnalysis} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Analyze Project
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}

                        {step === 'loading' && (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <Sparkles className="w-12 h-12 text-indigo-500 animate-pulse" />
                                <p className="text-slate-600 font-medium">Analyzing project data...</p>
                                <p className="text-sm text-slate-500">This may take a moment.</p>
                            </div>
                        )}

                        {step === 'result' && analysisResult && (
                            <div className="mt-6 space-y-6">
                                {/* Executive Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Executive Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-700">{analysisResult.executive_summary}</p>
                                        <div className="flex items-center gap-4 mt-4">
                                            <span className="font-semibold">Overall Health Score:</span>
                                            <Badge className="text-lg" variant={analysisResult.overall_health_score > 75 ? "success" : analysisResult.overall_health_score > 40 ? "warning" : "destructive"}>
                                                {analysisResult.overall_health_score} / 100
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Problem Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Problem Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {analysisResult.problem_analysis.map((p, i) => (
                                            <div key={i} className="p-3 bg-slate-50 rounded-lg">
                                                <h4 className="font-semibold text-slate-800">{p.problem}</h4>
                                                <p className="text-sm text-slate-600 mt-1">{p.details}</p>
                                                <p className="text-xs text-slate-500 mt-2"><strong>Evidence:</strong> {p.data_evidence}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Recommendations */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recommended Corrective Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {analysisResult.recommendations.map((rec, i) => (
                                            <div key={i} className="p-3 border rounded-lg">
                                                <div className="flex items-start gap-4">
                                                    <Checkbox id={`action-${i}`} checked={selectedActions.includes(i)} onCheckedChange={() => handleActionSelection(i)} className="mt-1" />
                                                    <div className="flex-1">
                                                        <Label htmlFor={`action-${i}`} className="font-semibold text-base text-slate-800 cursor-pointer">{rec.action}</Label>
                                                        <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                                                        <div className="flex items-center gap-4 mt-3 text-xs">
                                                            <Badge variant={rec.priority === 'Critical' || rec.priority === 'High' ? 'destructive' : 'outline'}>{rec.priority}</Badge>
                                                            <span><strong>Effort:</strong> {rec.estimated_effort_hours}h</span>
                                                            <span className="text-emerald-700"><strong>Impact:</strong> {rec.potential_impact}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                
                                <DialogFooter className="mt-6">
                                    <Button onClick={handleCreateTasks} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Create ({selectedActions.length}) Selected Tasks & Complete Audit
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
