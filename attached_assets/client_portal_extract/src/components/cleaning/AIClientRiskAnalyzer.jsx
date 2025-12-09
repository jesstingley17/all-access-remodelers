import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, TrendingDown } from 'lucide-react';

export default function AIClientRiskAnalyzer({ clients, jobs, feedback, onRefresh }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [riskAnalysis, setRiskAnalysis] = useState(null);

    const analyzeClientRisk = async () => {
        setIsAnalyzing(true);
        try {
            const clientData = clients.map(client => {
                const clientJobs = jobs.filter(j => j.client_id === client.id);
                const clientFeedback = feedback.filter(f => f.client_id === client.id);
                const cancelledJobs = clientJobs.filter(j => j.status === 'cancelled').length;
                const completedJobs = clientJobs.filter(j => j.status === 'completed').length;
                const avgRating = clientFeedback.length > 0 
                    ? clientFeedback.reduce((sum, f) => sum + f.rating, 0) / clientFeedback.length 
                    : null;
                
                const lastJobDate = clientJobs.length > 0
                    ? Math.max(...clientJobs.map(j => new Date(j.scheduled_start_at).getTime()))
                    : null;
                
                const daysSinceLastJob = lastJobDate 
                    ? Math.floor((Date.now() - lastJobDate) / (1000 * 60 * 60 * 24))
                    : null;

                return {
                    client_id: client.id,
                    name: client.name,
                    type: client.type,
                    total_jobs: clientJobs.length,
                    completed_jobs: completedJobs,
                    cancelled_jobs: cancelledJobs,
                    cancellation_rate: clientJobs.length > 0 ? (cancelledJobs / clientJobs.length) * 100 : 0,
                    avg_rating: avgRating,
                    days_since_last_job: daysSinceLastJob,
                    has_feedback: clientFeedback.length > 0
                };
            });

            const prompt = `You are a customer retention expert for a cleaning business. Analyze client data to identify at-risk clients who may churn.

Client Data:
${JSON.stringify(clientData, null, 2)}

Identify at-risk clients based on:
- Low ratings or negative feedback trends
- High cancellation rates
- Long periods since last service
- Declining engagement patterns`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        at_risk_clients: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    client_id: { type: "string" },
                                    risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                                    risk_factors: { type: "array", items: { type: "string" } },
                                    churn_probability: { type: "number", minimum: 0, maximum: 100 },
                                    recommended_actions: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        overall_retention_health: { type: "string", enum: ["good", "fair", "poor"] },
                        insights: { type: "string" }
                    }
                }
            });

            setRiskAnalysis(response);
        } catch (error) {
            console.error('Error analyzing client risk:', error);
        }
        setIsAnalyzing(false);
    };

    const getRiskColor = (level) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-amber-100 text-amber-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[level] || 'bg-slate-100 text-slate-800';
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Unknown Client';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    AI Client Risk Analysis
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!riskAnalysis ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Identify at-risk clients who may churn based on behavior patterns
                        </p>
                        <Button onClick={analyzeClientRisk} disabled={isAnalyzing}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="w-4 h-4 mr-2" />
                                    Analyze Client Risk
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className={`p-3 rounded-lg ${
                            riskAnalysis.overall_retention_health === 'good' ? 'bg-green-50' :
                            riskAnalysis.overall_retention_health === 'fair' ? 'bg-amber-50' : 'bg-red-50'
                        }`}>
                            <div className="font-medium capitalize">
                                Overall Health: {riskAnalysis.overall_retention_health}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{riskAnalysis.insights}</p>
                        </div>

                        {riskAnalysis.at_risk_clients?.length > 0 ? (
                            <div className="space-y-3">
                                {riskAnalysis.at_risk_clients.map((client, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-medium text-slate-900">
                                                {getClientName(client.client_id)}
                                            </div>
                                            <Badge className={getRiskColor(client.risk_level)}>
                                                {client.risk_level} risk - {client.churn_probability}%
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <div className="font-medium text-slate-700">Risk Factors:</div>
                                                <ul className="list-disc list-inside text-slate-600">
                                                    {client.risk_factors.map((factor, idx) => (
                                                        <li key={idx}>{factor}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            
                                            <div>
                                                <div className="font-medium text-slate-700">Recommended Actions:</div>
                                                <ul className="list-disc list-inside text-slate-600">
                                                    {client.recommended_actions.map((action, idx) => (
                                                        <li key={idx}>{action}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-500">
                                No at-risk clients identified
                            </div>
                        )}

                        <Button onClick={analyzeClientRisk} variant="outline" className="w-full" size="sm">
                            Refresh Analysis
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}