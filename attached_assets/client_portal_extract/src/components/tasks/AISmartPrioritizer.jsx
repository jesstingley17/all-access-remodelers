import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, Clock, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AISmartPrioritizer({ tasks, projects, onApplyPriority }) {
  const [recommendations, setRecommendations] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePriorities = async () => {
    setIsAnalyzing(true);
    try {
      const incompleteTasks = tasks.filter(t => t.status !== 'completed');
      
      const taskData = incompleteTasks.map(task => {
        const project = projects.find(p => p.id === task.project_id);
        const dependencies = task.dependencies || [];
        const hasDependencies = dependencies.length > 0;
        const blockedBy = incompleteTasks.filter(t => dependencies.includes(t.id));
        
        return {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          estimated_hours: task.estimated_hours,
          project_name: project?.name || 'No Project',
          project_priority: project?.priority || 'medium',
          has_dependencies: hasDependencies,
          blocked_by_count: blockedBy.length,
          blocking_others: incompleteTasks.filter(t => 
            (t.dependencies || []).includes(task.id)
          ).length
        };
      });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these tasks and suggest optimal prioritization order based on:
1. Deadlines (urgent items first)
2. Task dependencies (unblock others)
3. Project priority (critical projects first)
4. Estimated effort (quick wins vs. long tasks)
5. Current status (in-progress items)

Tasks to analyze:
${JSON.stringify(taskData, null, 2)}

Provide:
- Recommended priority for each task
- Reasoning based on multiple factors
- Top 5 tasks user should focus on NOW
- Quick wins (high impact, low effort)`,
        response_json_schema: {
          type: "object",
          properties: {
            top_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_id: { type: "string" },
                  task_title: { type: "string" },
                  recommended_priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
                  reasoning: { type: "string" },
                  factors: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_id: { type: "string" },
                  task_title: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            focus_now: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_id: { type: "string" },
                  task_title: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(response);
    } catch (error) {
      console.error('Error analyzing priorities:', error);
    }
    setIsAnalyzing(false);
  };

  const applyRecommendations = async () => {
    if (!recommendations?.top_priorities) return;
    
    for (const rec of recommendations.top_priorities) {
      await onApplyPriority(rec.task_id, rec.recommended_priority);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-amber-500',
      low: 'bg-blue-500'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-amber-100 text-amber-800 border-amber-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Smart Prioritization
          </CardTitle>
          <Button 
            onClick={analyzePriorities}
            disabled={isAnalyzing}
            variant="outline"
            className="bg-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Tasks
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recommendations && !isAnalyzing && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">Get AI-powered task prioritization</p>
            <p className="text-sm text-slate-500">
              Analyzes deadlines, dependencies, project priority, and effort
            </p>
          </div>
        )}

        {recommendations && (
          <>
            {recommendations.focus_now && recommendations.focus_now.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Focus Now - Top {recommendations.focus_now.length} Tasks
                  </h3>
                  <Button 
                    onClick={applyRecommendations}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Apply All Priorities
                  </Button>
                </div>
                <div className="space-y-2">
                  {recommendations.focus_now.slice(0, 5).map((item, index) => (
                    <Card key={item.task_id} className="border-l-4 border-l-red-500 bg-red-50">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{item.task_title}</p>
                            <p className="text-sm text-slate-600 mt-1">{item.reason}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {recommendations.quick_wins && recommendations.quick_wins.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Quick Wins
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recommendations.quick_wins.map((win) => (
                    <Card key={win.task_id} className="bg-emerald-50 border-emerald-200">
                      <CardContent className="p-3">
                        <p className="font-medium text-slate-900 text-sm mb-1">{win.task_title}</p>
                        <p className="text-xs text-slate-600">{win.impact}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {recommendations.top_priorities && recommendations.top_priorities.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">All Recommended Priorities</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recommendations.top_priorities.map((rec) => (
                    <Card key={rec.task_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-1 h-full ${getPriorityColor(rec.recommended_priority)} rounded-full flex-shrink-0`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium text-slate-900">{rec.task_title}</p>
                              <Badge className={getPriorityBadgeColor(rec.recommended_priority)}>
                                {rec.recommended_priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{rec.reasoning}</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.factors?.map((factor, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}