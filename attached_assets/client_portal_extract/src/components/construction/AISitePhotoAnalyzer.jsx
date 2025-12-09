import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, Upload, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AISitePhotoAnalyzer() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await base44.integrations.Core.UploadFile({ file });
            setUploadedImageUrl(result.file_url);
            analyzePhoto(result.file_url);
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsUploading(false);
        }
    };

    const analyzePhoto = async (imageUrl) => {
        setIsAnalyzing(true);
        try {
            const prompt = `You are a construction safety expert. Analyze this construction site photo for:

1. Safety Compliance:
   - PPE (Personal Protective Equipment) usage (hard hats, safety vests, gloves, boots)
   - Fall protection (harnesses, guardrails, scaffolding)
   - Proper tool usage
   - Hazardous conditions

2. Progress Assessment:
   - Work completion status
   - Quality indicators
   - Visible milestones

3. Issues or Concerns:
   - Safety violations
   - Quality problems
   - Potential risks

Provide detailed analysis with specific observations.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                file_urls: imageUrl,
                response_json_schema: {
                    type: "object",
                    properties: {
                        safety_score: { type: "number", minimum: 0, maximum: 100 },
                        safety_status: { type: "string", enum: ["compliant", "minor_issues", "major_violations"] },
                        ppe_compliance: {
                            type: "object",
                            properties: {
                                hard_hats: { type: "boolean" },
                                safety_vests: { type: "boolean" },
                                gloves: { type: "boolean" },
                                safety_boots: { type: "boolean" }
                            }
                        },
                        safety_violations: { type: "array", items: { type: "string" } },
                        safety_recommendations: { type: "array", items: { type: "string" } },
                        progress_indicators: { type: "array", items: { type: "string" } },
                        quality_observations: { type: "array", items: { type: "string" } },
                        hazards_detected: { type: "array", items: { type: "string" } },
                        overall_assessment: { type: "string" }
                    }
                }
            });

            setAnalysis(response);
        } catch (error) {
            console.error('Error analyzing photo:', error);
        }
        setIsAnalyzing(false);
        setIsUploading(false);
    };

    const getSafetyColor = (status) => {
        const colors = {
            compliant: 'bg-green-100 text-green-800',
            minor_issues: 'bg-amber-100 text-amber-800',
            major_violations: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    AI Site Photo Analyzer
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!uploadedImageUrl ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Upload a construction site photo for AI-powered safety and progress analysis
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            id="photo-upload"
                            className="hidden"
                        />
                        <label htmlFor="photo-upload">
                            <Button asChild disabled={isUploading}>
                                <span>
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Site Photo
                                        </>
                                    )}
                                </span>
                            </Button>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <img 
                                src={uploadedImageUrl} 
                                alt="Construction site" 
                                className="w-full rounded-lg border"
                            />
                            <Button
                                onClick={() => {
                                    setUploadedImageUrl(null);
                                    setAnalysis(null);
                                }}
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                            >
                                Upload New Photo
                            </Button>
                        </div>

                        {isAnalyzing ? (
                            <div className="text-center py-6">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                                <p className="text-slate-600">Analyzing photo...</p>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-4">
                                <Alert className={
                                    analysis.safety_status === 'compliant' ? 'bg-green-50 border-green-200' :
                                    analysis.safety_status === 'minor_issues' ? 'bg-amber-50 border-amber-200' :
                                    'bg-red-50 border-red-200'
                                }>
                                    <AlertDescription>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-5 h-5" />
                                                <span className="font-medium">Safety Status</span>
                                            </div>
                                            <Badge className={getSafetyColor(analysis.safety_status)}>
                                                {analysis.safety_status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="text-sm">Safety Score: {analysis.safety_score}%</div>
                                    </AlertDescription>
                                </Alert>

                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <div className="text-sm font-medium text-slate-700 mb-2">PPE Compliance:</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(analysis.ppe_compliance || {}).map(([item, compliant]) => (
                                            <div key={item} className="flex items-center gap-2 text-sm">
                                                {compliant ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                                )}
                                                <span className="capitalize">{item.replace('_', ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {analysis.safety_violations?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-red-700 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Safety Violations:
                                        </div>
                                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1 bg-red-50 p-3 rounded">
                                            {analysis.safety_violations.map((violation, idx) => (
                                                <li key={idx}>{violation}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.hazards_detected?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-orange-700">Hazards Detected:</div>
                                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1 bg-orange-50 p-3 rounded">
                                            {analysis.hazards_detected.map((hazard, idx) => (
                                                <li key={idx}>{hazard}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.safety_recommendations?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-slate-700">Safety Recommendations:</div>
                                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1 bg-blue-50 p-3 rounded">
                                            {analysis.safety_recommendations.map((rec, idx) => (
                                                <li key={idx}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.progress_indicators?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-slate-700">Progress Indicators:</div>
                                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                            {analysis.progress_indicators.map((indicator, idx) => (
                                                <li key={idx}>{indicator}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.quality_observations?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-slate-700">Quality Observations:</div>
                                        <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                            {analysis.quality_observations.map((obs, idx) => (
                                                <li key={idx}>{obs}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.overall_assessment && (
                                    <div className="bg-slate-50 p-3 rounded border text-sm text-slate-600">
                                        <div className="font-medium text-slate-700 mb-1">Overall Assessment:</div>
                                        {analysis.overall_assessment}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}