import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIProjectReportGenerator({ projects, tasks, timeEntries, clients, expenses }) {
  const [selectedProject, setSelectedProject] = useState("");
  const [reportType, setReportType] = useState("executive");
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    if (!selectedProject) return;

    setIsGenerating(true);
    try {
      const project = projects.find(p => p.id === selectedProject);
      const client = clients.find(c => c.id === project.client_id);
      const projectTasks = tasks.filter(t => t.project_id === selectedProject);
      const projectTime = timeEntries.filter(t => t.project_id === selectedProject);
      const projectExpenses = expenses.filter(e => e.project_id === selectedProject);

      const totalHours = projectTime.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60;
      const totalExpenses = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
      const completionRate = projectTasks.length > 0 ? (completedTasks / projectTasks.length * 100).toFixed(1) : 0;

      const reportPrompts = {
        executive: `Generate an executive summary report for project managers. Include:
- Project overview and current status
- Key achievements and milestones
- Budget and timeline status
- Critical issues requiring attention
- Strategic recommendations`,
        
        detailed: `Generate a detailed project report including:
- Comprehensive progress breakdown
- Task-by-task analysis
- Resource utilization details
- Budget breakdown with projections
- Risk assessment
- Detailed recommendations`,
        
        client: `Generate a client-friendly status report:
- Progress highlights in simple terms
- Value delivered so far
- What's next and when
- Any client actions needed
- Positive framing with transparency`
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${reportPrompts[reportType]}

Project Data:
- Name: ${project.name}
- Client: ${client?.company_name || 'N/A'}
- Status: ${project.status}
- Budget: $${project.budget || 0}
- Start: ${project.start_date || 'Not set'}
- Target End: ${project.end_date_target || 'Not set'}
- Tasks: ${projectTasks.length} total, ${completedTasks} completed (${completionRate}% complete)
- Hours: ${totalHours.toFixed(1)} logged
- Expenses: $${totalExpenses.toFixed(2)}
- Description: ${project.description || 'N/A'}

Generate a professional, well-structured report.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  heading: { type: "string" },
                  content: { type: "string" }
                }
              }
            },
            key_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setReport(response);
    } catch (error) {
      console.error('Error generating report:', error);
    }
    setIsGenerating(false);
  };

  const downloadReport = () => {
    if (!report) return;

    let content = `${report.title}\n${'='.repeat(report.title.length)}\n\n`;
    content += `${report.summary}\n\n`;
    
    if (report.key_metrics) {
      content += `KEY METRICS\n${'='.repeat(11)}\n`;
      report.key_metrics.forEach(metric => {
        content += `${metric.label}: ${metric.value}\n`;
      });
      content += '\n';
    }

    report.sections?.forEach(section => {
      content += `${section.heading}\n${'-'.repeat(section.heading.length)}\n`;
      content += `${section.content}\n\n`;
    });

    if (report.recommendations) {
      content += `RECOMMENDATIONS\n${'='.repeat(15)}\n`;
      report.recommendations.forEach((rec, i) => {
        content += `${i + 1}. ${rec}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Project Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Summary</SelectItem>
                <SelectItem value="detailed">Detailed Report</SelectItem>
                <SelectItem value="client">Client Status Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateReport}
            disabled={!selectedProject || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{report.title}</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-slate-700">{report.summary}</p>
            </div>

            {report.key_metrics && report.key_metrics.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {report.key_metrics.map((metric, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{metric.value}</div>
                        <div className="text-xs text-slate-600 mt-1">{metric.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {report.sections?.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-slate-900 mb-2">{section.heading}</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-700 whitespace-pre-line">{section.content}</p>
                </div>
              </div>
            ))}

            {report.recommendations && report.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}