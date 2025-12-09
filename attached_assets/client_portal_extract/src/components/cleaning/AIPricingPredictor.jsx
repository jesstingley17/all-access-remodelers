import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, DollarSign } from 'lucide-react';

export default function AIPricingPredictor({ services, locations }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [formData, setFormData] = useState({
        service_id: '',
        location_id: '',
        square_footage: ''
    });

    const predictPricing = async () => {
        if (!formData.service_id || !formData.location_id) return;
        
        setIsAnalyzing(true);
        try {
            const service = services.find(s => s.id === formData.service_id);
            const location = locations.find(l => l.id === formData.location_id);

            const prompt = `You are a cleaning pricing expert. Predict accurate pricing and duration for a cleaning job.

Service: ${service?.name}
Base Price: $${service?.default_price}
Base Duration: ${service?.default_duration_minutes} minutes
Location: ${location?.city}, ${location?.state}
Square Footage: ${formData.square_footage || 'Unknown'}

Analyze current market rates and provide accurate pricing and time estimates considering:
- Local market rates in ${location?.city}
- Property size
- Service complexity
- Typical cleaning industry standards`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggested_price: { type: "number" },
                        price_range_low: { type: "number" },
                        price_range_high: { type: "number" },
                        estimated_duration_minutes: { type: "number" },
                        pricing_factors: { type: "array", items: { type: "string" } },
                        confidence_level: { type: "string", enum: ["low", "medium", "high"] },
                        market_insights: { type: "string" }
                    }
                }
            });

            setPrediction(response);
        } catch (error) {
            console.error('Error predicting pricing:', error);
        }
        setIsAnalyzing(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    AI Pricing Predictor
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Service Type</Label>
                        <Select value={formData.service_id} onValueChange={(value) => setFormData({...formData, service_id: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map(service => (
                                    <SelectItem key={service.id} value={service.id}>
                                        {service.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select value={formData.location_id} onValueChange={(value) => setFormData({...formData, location_id: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map(location => (
                                    <SelectItem key={location.id} value={location.id}>
                                        {location.label} - {location.city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Square Footage (optional)</Label>
                        <Input
                            type="number"
                            value={formData.square_footage}
                            onChange={(e) => setFormData({...formData, square_footage: e.target.value})}
                            placeholder="e.g. 1500"
                        />
                    </div>

                    <Button 
                        onClick={predictPricing} 
                        disabled={isAnalyzing || !formData.service_id || !formData.location_id}
                        className="w-full"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Predict Price & Duration
                            </>
                        )}
                    </Button>
                </div>

                {prediction && (
                    <div className="space-y-3 pt-4 border-t">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Suggested Price</div>
                            <div className="text-3xl font-bold text-green-600">
                                ${prediction.suggested_price}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                Range: ${prediction.price_range_low} - ${prediction.price_range_high}
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Estimated Duration</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {prediction.estimated_duration_minutes} minutes
                            </div>
                            <div className="text-xs text-slate-500 mt-1 capitalize">
                                Confidence: {prediction.confidence_level}
                            </div>
                        </div>

                        {prediction.pricing_factors?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Pricing Factors:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {prediction.pricing_factors.map((factor, idx) => (
                                        <li key={idx}>{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {prediction.market_insights && (
                            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                {prediction.market_insights}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}