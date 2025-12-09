import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  MessageSquare,
  Heart,
  AlertTriangle,
  CheckCircle,
  Lightbulb
} from "lucide-react";
import { InvokeLLM } from '@/api/integrations';

export default function CommunicationAI({ client, messages, onAnalysisComplete }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeClientCommunication = async () => {
    setIsAnalyzing(true);
    try {
      const recentMessages = messages.slice(0, 20); // Last 20 messages
      
      const prompt = `You are a business relationship and communication expert. Analyze this client communication history and provide insights based on current research in business psychology and client relationship management.

Client: ${client.company_name}
Industry: ${client.industry || 'Not specified'}
Relationship Status: ${client.relationship_status}
Current Satisfaction Score: ${client.satisfaction_score || 'Not rated'}

Recent Communication History:
${recentMessages.map(msg => `
- ${msg.message_type}: "${msg.subject || 'No subject'}" 
  Content preview: ${msg.content.substring(0, 200)}...
  Date: ${msg.sent_at}
  Priority: ${msg.priority}
`).join('\n')}

Based on current research in client relationship management and communication psychology, analyze:
1. Communication patterns and sentiment trends
2. Client satisfaction indicators and relationship health
3. Potential risks or opportunities in the relationship
4. Recommended communication strategies and improvements
5. Optimal communication frequency and timing for this client`;

      const response = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            relationship_health_score: { type: "number", minimum: 0, maximum: 100 },
            sentiment_trend: { type: "string", enum: ["improving", "stable", "declining"] },
            communication_style: { type: "string" },
            satisfaction_prediction: { type: "number", minimum: 1, maximum: 10 },
            risk_factors: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            optimal_communication_frequency: { type: "string" },
            preferred_communication_times: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysis(response);
      onAnalysisComplete(response);
    } catch (error) {
      console.error('Error analyzing communication:', error);
    }
    setIsAnalyzing(false);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle };
    if (score >= 60) return { bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertTriangle };
    return { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle };
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'declining': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <MessageSquare className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Brain className="w-5 h-5" />
          AI Communication Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis && !isAnalyzing && (
          <div className="text-center py-6">
            <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Get AI-powered insights into your client relationship</p>
            <Button onClick={analyzeClientCommunication}>
              <Brain className="w-4 h-4 mr-2" />
              Analyze Communication Pattern
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Analyzing communication patterns and relationship health...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Relationship Health Score */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">Relationship Health</h4>
                <Badge className={getHealthColor(analysis.relationship_health_score).bg + ' ' + getHealthColor(analysis.relationship_health_score).text}>
                  {analysis.relationship_health_score}/100
                </Badge>
              </div>
              <Progress value={analysis.relationship_health_score} className="h-3 mb-2" />
              <div className="flex items-center gap-2 text-sm">
                {getTrendIcon(analysis.sentiment_trend)}
                <span className="text-slate-600">
                  Sentiment trend: <strong>{analysis.sentiment_trend}</strong>
                </span>
              </div>
            </div>

            {/* Key Insights Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Predicted Satisfaction</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {analysis.satisfaction_prediction}/10
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Communication Style</span>
                </div>
                <div className="text-sm text-purple-800 font-medium">
                  {analysis.communication_style}
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            {analysis.risk_factors && analysis.risk_factors.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {analysis.risk_factors.map((risk, index) => (
                    <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {analysis.opportunities && analysis.opportunities.length > 0 && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Growth Opportunities
                </h4>
                <ul className="space-y-1">
                  {analysis.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-emerald-800 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Communication Optimization */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3">Communication Optimization</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Optimal Frequency:</span>
                  <p className="font-medium text-slate-900">{analysis.optimal_communication_frequency}</p>
                </div>
                {analysis.preferred_communication_times && (
                  <div>
                    <span className="text-slate-600">Best Times:</span>
                    <p className="font-medium text-slate-900">
                      {analysis.preferred_communication_times.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={analyzeClientCommunication}
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Brain className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}