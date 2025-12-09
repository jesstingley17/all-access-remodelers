import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Loader2, TrendingUp, AlertCircle, Copy, Send, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AIFeedbackAnalyzer({ feedback, jobs, clients }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [draftResponse, setDraftResponse] = useState('');
    const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

    const analyzeAllFeedback = async () => {
        setIsAnalyzing(true);
        try {
            const feedbackWithDetails = feedback.map(f => {
                const job = jobs.find(j => j.id === f.job_id);
                const client = clients.find(c => c.id === f.client_id);
                return { ...f, job, client };
            });

            const prompt = `You are a customer experience analyst for a cleaning service company. Analyze all customer feedback to identify patterns, sentiment, and common issues.

Total Feedback Entries: ${feedback.length}

Recent Feedback:
${feedbackWithDetails.slice(0, 20).map(f => `
Rating: ${f.rating}/5
Client: ${f.client?.name}
Comment: ${f.comment || 'No comment'}
Date: ${new Date(f.created_date).toLocaleDateString()}
`).join('\n---\n')}

Provide comprehensive analysis:
1. Overall sentiment distribution
2. Common themes (positive and negative)
3. Recurring issues or complaints
4. Areas of excellence
5. Actionable recommendations for improvement
6. Priority issues that need immediate attention`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_sentiment: { type: "string", enum: ["very_positive", "positive", "neutral", "negative", "very_negative"] },
                        sentiment_breakdown: {
                            type: "object",
                            properties: {
                                positive_percent: { type: "number" },
                                neutral_percent: { type: "number" },
                                negative_percent: { type: "number" }
                            }
                        },
                        common_positive_themes: { type: "array", items: { type: "string" } },
                        common_negative_themes: { type: "array", items: { type: "string" } },
                        recurring_issues: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    issue: { type: "string" },
                                    frequency: { type: "string" },
                                    severity: { type: "string", enum: ["low", "medium", "high", "critical"] }
                                }
                            }
                        },
                        areas_of_excellence: { type: "array", items: { type: "string" } },
                        priority_actions: { type: "array", items: { type: "string" } },
                        recommendations: { type: "string" },
                        customer_satisfaction_score: { type: "number", minimum: 0, maximum: 100 }
                    }
                }
            });

            setAnalysis(response);
        } catch (error) {
            console.error('Error analyzing feedback:', error);
        }
        setIsAnalyzing(false);
    };

    const generateResponse = async (feedbackItem) => {
        setIsGeneratingResponse(true);
        setSelectedFeedback(feedbackItem);
        
        try {
            const job = jobs.find(j => j.id === feedbackItem.job_id);
            const client = clients.find(c => c.id === feedbackItem.client_id);

            const prompt = `You are a professional customer service representative for a cleaning service company. Generate a personalized, empathetic, and professional response to this customer feedback.

Customer Feedback:
- Rating: ${feedbackItem.rating}/5
- Comment: ${feedbackItem.comment || 'No written comment'}
- Client: ${client?.name}
- Date: ${new Date(feedbackItem.created_date).toLocaleDateString()}

Job Details:
- Service Date: ${job?.scheduled_start_at ? new Date(job.scheduled_start_at).toLocaleDateString() : 'N/A'}
- Status: ${job?.status}

Generate a draft response that:
1. Thanks the customer for their feedback
2. Addresses any specific concerns or compliments
3. For low ratings (1-3): Apologizes sincerely and offers a solution
4. For high ratings (4-5): Expresses appreciation and reinforces value
5. Invites further communication if needed
6. Maintains a warm, professional tone

Keep the response concise but meaningful (2-3 short paragraphs).`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false
            });

            setDraftResponse(response);
        } catch (error) {
            console.error('Error generating response:', error);
        }
        setIsGeneratingResponse(false);
    };

    const getSentimentColor = (sentiment) => {
        const colors = {
            very_positive: 'bg-green-100 text-green-800',
            positive: 'bg-blue-100 text-blue-800',
            neutral: 'bg-slate-100 text-slate-800',
            negative: 'bg-orange-100 text-orange-800',
            very_negative: 'bg-red-100 text-red-800'
        };
        return colors[sentiment] || 'bg-slate-100 text-slate-800';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-amber-100 text-amber-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[severity] || 'bg-slate-100 text-slate-800';
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(draftResponse);
    };

    const sendResponse = async () => {
        if (!selectedFeedback || !draftResponse) return;
        
        const client = clients.find(c => c.id === selectedFeedback.client_id);
        if (!client) return;

        try {
            await base44.integrations.Core.SendEmail({
                to: client.email,
                subject: 'Thank you for your feedback',
                body: draftResponse
            });

            setDraftResponse('');
            setSelectedFeedback(null);
        } catch (error) {
            console.error('Error sending response:', error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        AI Feedback Analyzer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!analysis ? (
                        <div className="text-center py-6">
                            <p className="text-slate-600 mb-4">
                                Analyze all customer feedback for sentiment, patterns, and actionable insights
                            </p>
                            <Button onClick={analyzeAllFeedback} disabled={isAnalyzing} className="bg-purple-600 hover:bg-purple-700">
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing {feedback.length} feedback entries...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Analyze Feedback
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge className={getSentimentColor(analysis.overall_sentiment)}>
                                        {analysis.overall_sentiment.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <Button onClick={() => setAnalysis(null)} variant="outline" size="sm">
                                    Refresh Analysis
                                </Button>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                                <div className="text-sm text-slate-600 mb-2">Customer Satisfaction Score</div>
                                <div className="text-3xl font-bold text-slate-900">
                                    {analysis.customer_satisfaction_score}/100
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-green-50 p-3 rounded border border-green-200">
                                    <div className="text-xs text-slate-600 mb-1">Positive</div>
                                    <div className="text-lg font-bold text-green-600">
                                        {analysis.sentiment_breakdown.positive_percent.toFixed(0)}%
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border">
                                    <div className="text-xs text-slate-600 mb-1">Neutral</div>
                                    <div className="text-lg font-bold text-slate-600">
                                        {analysis.sentiment_breakdown.neutral_percent.toFixed(0)}%
                                    </div>
                                </div>
                                <div className="bg-red-50 p-3 rounded border border-red-200">
                                    <div className="text-xs text-slate-600 mb-1">Negative</div>
                                    <div className="text-lg font-bold text-red-600">
                                        {analysis.sentiment_breakdown.negative_percent.toFixed(0)}%
                                    </div>
                                </div>
                            </div>

                            {analysis.areas_of_excellence?.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium text-green-700 mb-2">Areas of Excellence</div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.areas_of_excellence.map((area, idx) => (
                                            <Badge key={idx} className="bg-green-100 text-green-800">
                                                {area}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.recurring_issues?.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium text-orange-700 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Recurring Issues
                                    </div>
                                    <div className="space-y-2">
                                        {analysis.recurring_issues.map((issue, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-orange-50 p-3 rounded border border-orange-200">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{issue.issue}</div>
                                                    <div className="text-xs text-slate-600">Frequency: {issue.frequency}</div>
                                                </div>
                                                <Badge className={getSeverityColor(issue.severity)}>
                                                    {issue.severity}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.priority_actions?.length > 0 && (
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertDescription>
                                        <div className="font-medium mb-2">Priority Actions</div>
                                        <ul className="text-sm space-y-1 list-disc list-inside">
                                            {analysis.priority_actions.map((action, idx) => (
                                                <li key={idx}>{action}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {analysis.recommendations && (
                                <div className="bg-slate-50 p-4 rounded border text-sm">
                                    <div className="font-medium mb-2">Recommendations</div>
                                    <p className="text-slate-700">{analysis.recommendations}</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Auto-Generate Responses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!selectedFeedback ? (
                        <div className="space-y-3">
                            <p className="text-slate-600 mb-4">
                                Select feedback to generate a personalized draft response
                            </p>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {feedback.slice(0, 20).map(f => {
                                    const client = clients.find(c => c.id === f.client_id);
                                    return (
                                        <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer"
                                             onClick={() => generateResponse(f)}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm">{client?.name}</span>
                                                    <Badge className={f.rating >= 4 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                                        {f.rating}/5
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-slate-600 line-clamp-1">
                                                    {f.comment || 'No comment'}
                                                </div>
                                            </div>
                                            <Button size="sm" disabled={isGeneratingResponse}>
                                                {isGeneratingResponse ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Generate'
                                                )}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">
                                        {clients.find(c => c.id === selectedFeedback.client_id)?.name}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        Rating: {selectedFeedback.rating}/5
                                    </div>
                                </div>
                                <Button onClick={() => { setSelectedFeedback(null); setDraftResponse(''); }} variant="outline" size="sm">
                                    Back
                                </Button>
                            </div>

                            {selectedFeedback.comment && (
                                <div className="bg-slate-50 p-3 rounded border text-sm">
                                    <div className="font-medium mb-1">Original Feedback:</div>
                                    <div className="text-slate-700">{selectedFeedback.comment}</div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium mb-2 block">AI-Generated Response:</label>
                                <Textarea
                                    value={draftResponse}
                                    onChange={(e) => setDraftResponse(e.target.value)}
                                    rows={8}
                                    className="font-sans"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                                <Button onClick={sendResponse} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Email
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}