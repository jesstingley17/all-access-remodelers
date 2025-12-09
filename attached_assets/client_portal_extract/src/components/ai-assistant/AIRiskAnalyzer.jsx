import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIRiskAnalyzer({ projects, tasks, timeEntries, expenses }) {
  const [selectedProject, setSelectedProject] = useState("");
  const [risks, setRisks] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRisks = async () => {
    if (!selectedProject) return;

    setIsAnalyzing(true);
    try {
      const project = projects.find(p => p.id === selectedProject);
      const projectTasks = tasks.filter(t => t.project_id === selectedProject);
      const projectTime = timeEntries.filter(t => t.project_id === selectedProject);
      const projectExpenses = expenses.filter(e => e.project_id === selectedProject);

      const totalHours = projectTime.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60;
      const totalExpenses = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
      const overdueTasks = projectTasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      );

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform a comprehensive risk analysis for this project:

Project: ${project.name}
Status: ${project.status}
Budget: $${project.budget || 0}
Start Date: ${project.start_date || 'Not set'}
Target End: ${project.end_date_target || 'Not set'}

Tasks: ${projectTasks.length} total, ${completedTasks} completed, ${overdueTasks.length} overdue
Hours Logged: ${totalHours}
Expenses: $${totalExpenses}

Identify:
1. Schedule risks (delays, missed deadlines)
2. Budget risks (overspending, underestimation)
3. Resource risks (capacity, skill gaps)
4. Quality risks (rushed work, technical debt)
5. Dependencies and blockers

Provide specific, actionable insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            risk_score: { type: "number", minimum: 0, maximum: 100 },
            risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
            identified_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  risk: { type: "string" },
                  impact: { type: "string", enum: ["low", "medium", "high"] },
                  likelihood: { type: "string", enum: ["low", "medium", "high"] },
                  mitigation: { type: "string" }
                }
              }
            },
            delay_probability: { type: "number", minimum: 0, maximum: 100 },
            budget_overrun_risk: { type: "string", enum: ["low", "medium", "high"] },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setRisks(response);
    } catch (error) {
      console.error('Error analyzing risks:', error);
    }
    setIsAnalyzing(false);
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-emerald-100 text-emerald-800',
      medium: 'bg-amber-100 text-amber-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a project to analyze" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={analyzeRisks}
              disabled={!selectedProject || isAnalyzing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Analyze Risks
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {risks && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    risks.risk_score > 70 ? 'text-red-600' :
                    risks.risk_score > 40 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {risks.risk_score}%
                  </div>
                  <div className="text-sm text-slate-600">Overall Risk Score</div>
                  <Badge className={`mt-2 ${getRiskColor(risks.risk_level)}`}>
                    {risks.risk_level} risk
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {risks.delay_probability}%
                  </div>
                  <div className="text-sm text-slate-600">Delay Probability</div>
                  <TrendingDown className="w-5 h-5 text-orange-600 mx-auto mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Badge className={`text-lg px-4 py-2 ${getRiskColor(risks.budget_overrun_risk)}`}>
                    {risks.budget_overrun_risk}
                  </Badge>
                  <div className="text-sm text-slate-600 mt-3">Budget Overrun Risk</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Identified Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {risks.identified_risks?.map((risk, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{risk.category}</Badge>
                        <div className="flex gap-2">
                          <Badge className={getRiskColor(risk.impact)}>
                            Impact: {risk.impact}
                          </Badge>
                          <Badge className={getRiskColor(risk.likelihood)}>
                            Likelihood: {risk.likelihood}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-medium text-slate-900 mb-2">{risk.risk}</p>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm text-slate-700">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {risks.recommendations && risks.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {risks.recommendations.map((rec, index) => (
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