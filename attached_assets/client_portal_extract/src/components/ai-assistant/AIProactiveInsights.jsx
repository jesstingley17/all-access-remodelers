import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Clock, DollarSign, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIProactiveInsights({ projects, tasks, timeEntries, expenses }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeProjects = async () => {
    setIsAnalyzing(true);
    try {
      const activeProjects = projects.filter(p => p.status === 'active');
      const projectSummaries = activeProjects.map(project => {
        const projectTasks = tasks.filter(t => t.project_id === project.id);
        const completedTasks = projectTasks.filter(t => t.status === 'completed');
        const overdueTasks = projectTasks.filter(t => 
          t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
        );
        const projectTime = timeEntries.filter(t => t.project_id === project.id);
        const totalHours = projectTime.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60;

        return {
          name: project.name,
          status: project.status,
          total_tasks: projectTasks.length,
          completed_tasks: completedTasks.length,
          overdue_tasks: overdueTasks.length,
          hours_logged: totalHours,
          budget: project.budget,
          start_date: project.start_date,
          target_end: project.end_date_target
        };
      });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these active projects and provide proactive insights about risks, delays, and opportunities.

Projects data:
${JSON.stringify(projectSummaries, null, 2)}

Identify:
1. Critical risks that need immediate attention
2. Projects likely to face delays
3. Budget concerns
4. Resource allocation issues
5. Quick wins or opportunities`,
        response_json_schema: {
          type: "object",
          properties: {
            critical_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string", enum: ["high", "medium", "low"] },
                  project_name: { type: "string" },
                  issue: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  project_name: { type: "string" },
                  opportunity: { type: "string" }
                }
              }
            },
            overall_health: { type: "string", enum: ["excellent", "good", "concerning", "critical"] }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Error analyzing projects:', error);
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (projects.length > 0) {
      analyzeProjects();
    }
  }, [projects.length]);

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity] || colors.medium;
  };

  const getHealthColor = (health) => {
    const colors = {
      excellent: 'text-emerald-600',
      good: 'text-blue-600',
      concerning: 'text-amber-600',
      critical: 'text-red-600'
    };
    return colors[health] || colors.good;
  };

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Analyzing your projects...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Proactive Insights
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="text-sm">
                Overall Health: 
                <span className={`font-bold ml-2 ${getHealthColor(insights.overall_health)}`}>
                  {insights.overall_health?.toUpperCase()}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={analyzeProjects}
                disabled={isAnalyzing}
              >
                <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.critical_alerts && insights.critical_alerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Critical Alerts
              </h3>
              {insights.critical_alerts.map((alert, index) => (
                <Card key={index} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{alert.project_name}</Badge>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="font-medium text-slate-900 mb-2">{alert.issue}</p>
                        <p className="text-sm text-slate-600">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {insights.opportunities && insights.opportunities.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Opportunities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.opportunities.map((opp, index) => (
                  <Card key={index} className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2">{opp.project_name}</Badge>
                      <p className="text-sm text-slate-700">{opp.opportunity}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}