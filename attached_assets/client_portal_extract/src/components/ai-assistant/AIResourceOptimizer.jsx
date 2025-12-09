import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIResourceOptimizer({ projects, tasks, timeEntries }) {
  const [optimization, setOptimization] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeResources = async () => {
    setIsOptimizing(true);
    try {
      const activeProjects = projects.filter(p => p.status === 'active');
      
      const resourceData = activeProjects.map(project => {
        const projectTasks = tasks.filter(t => t.project_id === project.id && t.status !== 'completed');
        const projectTime = timeEntries.filter(t => t.project_id === project.id);
        const totalHours = projectTime.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60;
        
        const assignees = [...new Set(projectTasks.map(t => t.assignee).filter(Boolean))];
        
        return {
          project_name: project.name,
          active_tasks: projectTasks.length,
          assignees: assignees,
          hours_logged: totalHours,
          target_end: project.end_date_target,
          priority: project.priority || 'medium'
        };
      });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze resource allocation across projects and suggest optimizations:

Projects and Resources:
${JSON.stringify(resourceData, null, 2)}

Provide:
1. Resource bottlenecks and overallocation
2. Underutilized resources
3. Optimal resource reallocation suggestions
4. Capacity planning recommendations
5. Skills gaps or training needs`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_utilization: { type: "string", enum: ["underutilized", "optimal", "overutilized"] },
            bottlenecks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  resource: { type: "string" },
                  issue: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            reallocation_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from_project: { type: "string" },
                  to_project: { type: "string" },
                  resource: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            },
            capacity_recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setOptimization(response);
    } catch (error) {
      console.error('Error optimizing resources:', error);
    }
    setIsOptimizing(false);
  };

  const getUtilizationColor = (level) => {
    const colors = {
      underutilized: 'text-blue-600',
      optimal: 'text-emerald-600',
      overutilized: 'text-red-600'
    };
    return colors[level] || colors.optimal;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resource Optimization</CardTitle>
            <Button 
              onClick={optimizeResources}
              disabled={isOptimizing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Optimize Resources
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Analyze resource allocation across active projects and get AI-powered suggestions for optimal distribution.
          </p>
        </CardContent>
      </Card>

      {optimization && (
        <>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-slate-600 mb-2">Overall Utilization</div>
              <div className={`text-3xl font-bold ${getUtilizationColor(optimization.overall_utilization)}`}>
                {optimization.overall_utilization?.toUpperCase()}
              </div>
            </CardContent>
          </Card>

          {optimization.bottlenecks && optimization.bottlenecks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Resource Bottlenecks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimization.bottlenecks.map((bottleneck, index) => (
                    <Card key={index} className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="font-semibold text-slate-900 mb-1">{bottleneck.resource}</div>
                        <p className="text-sm text-slate-700 mb-2">{bottleneck.issue}</p>
                        <Badge variant="outline" className="text-xs">
                          Impact: {bottleneck.impact}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {optimization.reallocation_suggestions && optimization.reallocation_suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Reallocation Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimization.reallocation_suggestions.map((suggestion, index) => (
                    <Card key={index} className="border-l-4 border-l-emerald-500">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{suggestion.resource}</Badge>
                          <span className="text-sm text-slate-600">→</span>
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {suggestion.to_project}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700">{suggestion.reasoning}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {optimization.capacity_recommendations && optimization.capacity_recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Capacity Planning Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {optimization.capacity_recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}