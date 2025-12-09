import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AISafetyPhotoAnalyzer({ projectId }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const fileInputRef = useRef(null);

    const handlePhotoCapture = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setPhotoUrl(file_url);

            const prompt = `You are a construction safety compliance expert. Analyze this construction site photo for safety violations and compliance issues.

Analyze for:
- Personal Protective Equipment (PPE) compliance (hard hats, safety vests, boots, gloves, eye protection)
- Fall protection (guardrails, harnesses, safety nets)
- Scaffolding safety (proper assembly, rails, toe boards)
- Ladder safety (proper angle, secure, no damage)
- Electrical hazards (exposed wires, improper grounding)
- Housekeeping (trip hazards, debris, organized materials)
- Equipment safety (guards in place, proper use)
- Fire safety (extinguishers, exit paths, flammable storage)
- Signage (warning signs, restricted areas)
- Work zone safety (barriers, traffic control)

Provide a comprehensive safety assessment.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_safety_score: { type: "number", minimum: 0, maximum: 100 },
                        risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                        violations_found: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    category: { type: "string" },
                                    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                                    description: { type: "string" },
                                    location_in_photo: { type: "string" }
                                }
                            }
                        },
                        compliant_items: { type: "array", items: { type: "string" } },
                        immediate_actions_required: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } },
                        osha_standards_referenced: { type: "array", items: { type: "string" } },
                        summary: { type: "string" }
                    }
                }
            });

            setAnalysis(response);

            if (projectId && response.violations_found?.length > 0) {
                const criticalViolations = response.violations_found.filter(v => 
                    v.severity === 'critical' || v.severity === 'high'
                );
                
                if (criticalViolations.length > 0) {
                    await base44.entities.SafetyIncident.create({
                        project_id: projectId,
                        severity: response.risk_level,
                        description: `AI Safety Analysis: ${response.summary}`,
                        occurred_at: new Date().toISOString(),
                        status: 'open',
                        attachments: [{ url: file_url, name: file.name }]
                    });
                }
            }
        } catch (error) {
            console.error('Error analyzing photo:', error);
        }
        setIsAnalyzing(false);
    };

    const getRiskColor = (level) => {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-amber-100 text-amber-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[level] || 'bg-slate-100 text-slate-800';
    };

    const getSeverityIcon = (severity) => {
        if (severity === 'critical' || severity === 'high') {
            return <AlertTriangle className="w-4 h-4 text-red-600" />;
        }
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-orange-600" />
                    AI Safety Compliance Check
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                />

                {!analysis ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Take a photo to check for safety compliance
                        </p>
                        <Button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                            className="w-full"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4 mr-2" />
                                    Capture & Analyze
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {photoUrl && (
                            <img 
                                src={photoUrl} 
                                alt="Analyzed site" 
                                className="w-full rounded-lg border"
                            />
                        )}

                        <Alert className={
                            analysis.risk_level === 'critical' ? 'bg-red-50 border-red-200' :
                            analysis.risk_level === 'high' ? 'bg-orange-50 border-orange-200' :
                            analysis.risk_level === 'medium' ? 'bg-amber-50 border-amber-200' :
                            'bg-green-50 border-green-200'
                        }>
                            <AlertDescription>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Safety Score</span>
                                    <Badge className={getRiskColor(analysis.risk_level)}>
                                        {analysis.risk_level} risk
                                    </Badge>
                                </div>
                                <div className="text-2xl font-bold">
                                    {analysis.overall_safety_score}/100
                                </div>
                            </AlertDescription>
                        </Alert>

                        {analysis.summary && (
                            <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                                {analysis.summary}
                            </div>
                        )}

                        {analysis.violations_found?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-red-700">
                                    Safety Violations ({analysis.violations_found.length})
                                </div>
                                {analysis.violations_found.map((violation, idx) => (
                                    <div key={idx} className="p-3 bg-red-50 rounded border border-red-200">
                                        <div className="flex items-start gap-2">
                                            {getSeverityIcon(violation.severity)}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm text-red-900">
                                                        {violation.category}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {violation.severity}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-red-700">
                                                    {violation.description}
                                                </div>
                                                {violation.location_in_photo && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        Location: {violation.location_in_photo}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analysis.immediate_actions_required?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-orange-700">
                                    Immediate Actions Required
                                </div>
                                <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                                    {analysis.immediate_actions_required.map((action, idx) => (
                                        <li key={idx}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {analysis.compliant_items?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-green-700">
                                    Compliant Items
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.compliant_items.map((item, idx) => (
                                        <Badge key={idx} className="bg-green-100 text-green-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.recommendations?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">
                                    Recommendations
                                </div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {analysis.recommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Button 
                            onClick={() => {
                                setAnalysis(null);
                                setPhotoUrl(null);
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            Analyze Another Photo
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}