
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, ArrowRight, ArrowLeft, Shield, Eye, Zap, Clock, Wand2 } from "lucide-react";

const RISK_FACTORS = [
  {
    key: 'scope_clarity',
    title: 'Scope Clarity',
    icon: Eye,
    description: 'How well-defined and clear are the project requirements?',
    labels: ['Very unclear', 'Some gaps', 'Mostly clear', 'Well-defined', 'Crystal clear']
  },
  {
    key: 'client_experience',
    title: 'Client Experience',
    icon: Shield,
    description: 'How experienced is the client with similar projects?',
    labels: ['First-timer', 'Limited exp.', 'Some exp.', 'Experienced', 'Very experienced']
  },
  {
    key: 'technical_complexity',
    title: 'Technical Complexity',
    icon: Zap,
    description: 'How complex is the technical implementation?',
    labels: ['Very simple', 'Simple', 'Moderate', 'Complex', 'Very complex']
  },
  {
    key: 'timeline_pressure',
    title: 'Timeline Pressure',
    icon: Clock,
    description: 'How tight is the project timeline?',
    labels: ['Very relaxed', 'Comfortable', 'Reasonable', 'Tight', 'Very tight']
  }
];

export default function RiskAssessmentForm({ data, onChange, onNext, onPrev, onAnalyze, isAnalyzing }) {
  const handleNext = (e) => {
    e.preventDefault();
    onNext();
  };

  const updateRiskFactor = (factor, value) => {
    onChange({
      risk_assessment: {
        ...data.risk_assessment,
        [factor]: value[0] // Slider returns array
      }
    });
  };

  const calculateOverallRisk = () => {
    const scores = data.risk_assessment;
    if (!scores) return 'medium';
    
    // Ensure all scores are present before calculating average
    if (scores.scope_clarity === undefined || 
        scores.client_experience === undefined || 
        scores.technical_complexity === undefined || 
        scores.timeline_pressure === undefined) {
      return 'medium'; // Or some other default/loading state if data is incomplete
    }

    const avgScore = (scores.scope_clarity + scores.client_experience + 
                     scores.technical_complexity + scores.timeline_pressure) / 4;
    
    if (avgScore >= 4) return 'high';
    if (avgScore >= 3) return 'medium';
    return 'low';
  };

  const overallRisk = calculateOverallRisk();
  const riskColors = {
    low: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    high: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
  };

  const getRiskRecommendations = () => {
    const scores = data.risk_assessment;
    const recommendations = [];

    if (!scores) return []; // No scores, no recommendations

    // Only add recommendations if the score is actually at the high end (4 or 5)
    if (scores.scope_clarity >= 4) {
      recommendations.push("Consider adding 15-20% buffer time due to unclear scope");
    }
    if (scores.client_experience >= 4) {
      recommendations.push("Plan for extra communication and client education time");
    }
    if (scores.technical_complexity >= 4) {
      recommendations.push("Allocate time for research, testing, and technical challenges");
    }
    if (scores.timeline_pressure >= 4) {
      recommendations.push("Consider negotiating timeline or reducing scope");
    }

    return recommendations;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <AlertTriangle className="w-5 h-5" />
          Risk Assessment
        </CardTitle>
        <p className="text-sm text-slate-600">
          Evaluate potential project risks to better plan and price your work
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleNext} className="space-y-8">
          {/* Risk Factors */}
          <div className="space-y-6">
            {RISK_FACTORS.map((factor) => {
              const IconComponent = factor.icon;
              // Ensure default value is within range [1, 5] if data is missing or invalid
              const currentValue = data.risk_assessment?.[factor.key] || 3;
              
              return (
                <div key={factor.key} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{factor.title}</h4>
                      <p className="text-sm text-slate-600">{factor.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="px-3">
                      <Slider
                        value={[currentValue]}
                        onValueChange={(value) => updateRiskFactor(factor.key, value)}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 px-3">
                      <span>{factor.labels[0]}</span>
                      <span className="font-medium text-slate-900">
                        {factor.labels[currentValue - 1]}
                      </span>
                      <span>{factor.labels[4]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Risk Summary */}
          <div className={`p-6 rounded-lg border ${riskColors[overallRisk].bg} ${riskColors[overallRisk].border}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${riskColors[overallRisk].bg}`}>
                <AlertTriangle className={`w-6 h-6 ${riskColors[overallRisk].text}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${riskColors[overallRisk].text}`}>
                  {overallRisk.toUpperCase()} RISK PROJECT
                </h3>
                <p className="text-sm text-slate-600">Based on your assessment responses</p>
              </div>
            </div>

            {/* Risk Recommendations */}
            {getRiskRecommendations().length > 0 && (
              <div className="space-y-2">
                <h4 className={`font-semibold ${riskColors[overallRisk].text}`}>Recommendations:</h4>
                <ul className="space-y-1">
                  {getRiskRecommendations().map((rec, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6">
            <Button type="button" variant="outline" onClick={onPrev} size="lg" className="px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="px-6"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
              <Button 
                type="submit" 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
