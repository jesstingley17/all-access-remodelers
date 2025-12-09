import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Wand2,
    AlertTriangle,
    ShieldCheck,
    Calendar,
    Clock,
    TrendingUp,
    Info
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from '@/components/ui/skeleton';

export default function AIAnalysisSummary({ analysis, isLoading }) {
    if (isLoading) {
        return (
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Wand2 className="w-5 h-5" />
                        AI Project Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        )
    }

    if (!analysis) return null;

    const riskColors = {
        low: "bg-emerald-100 text-emerald-800",
        medium: "bg-amber-100 text-amber-800",
        high: "bg-red-100 text-red-800"
    };

    return (
        <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Wand2 className="w-5 h-5" />
                    AI Project Analysis
                </CardTitle>
                <p className="text-sm text-blue-700">
                    Based on project data and your historical performance.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 font-semibold">
                        {analysis.predicted_risk === 'low' ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                        Predicted Risk:
                    </div>
                    <Badge className={riskColors[analysis.predicted_risk]}>
                        {analysis.predicted_risk}
                    </Badge>
                </div>

                {analysis.risk_factors && analysis.risk_factors.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Key Risk Factors:</h4>
                        <ul className="space-y-1 list-disc list-inside text-blue-700 text-sm">
                            {analysis.risk_factors.map((factor, index) => (
                                <li key={index}>{factor}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                    {analysis.suggested_deadline && (
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <div>
                                <div className="text-sm font-semibold text-blue-800">Suggested Deadline</div>
                                <div className="text-sm text-blue-700">{format(new Date(analysis.suggested_deadline), 'MMMM d, yyyy')}</div>
                            </div>
                        </div>
                    )}
                    {analysis.suggested_buffer_hours > 0 && (
                         <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <div>
                                <div className="text-sm font-semibold text-blue-800">Recommended Buffer</div>
                                <div className="text-sm text-blue-700">{analysis.suggested_buffer_hours} hours</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm text-blue-700 pt-4 border-t border-blue-200">
                    <Info className="w-4 h-4" />
                    <span>Confidence Score for this analysis: <strong>{analysis.confidence_score}%</strong></span>
                </div>
            </CardContent>
        </Card>
    );
}