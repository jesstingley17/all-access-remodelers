import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Clock, Calendar, TrendingUp } from "lucide-react";
import { InvokeLLM } from '@/api/integrations';
import { format } from 'date-fns';

export default function AITimeSuggest({ currentData, onSuggestion }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateTimeSuggestions = async () => {
    setIsLoading(true);
    try {
      const prompt = `You are a productivity and scheduling expert. Based on current research on optimal meeting times, productivity patterns, and business communication best practices, suggest the best times for this event.

Event Details:
- Type: ${currentData.event_type}
- Title: ${currentData.title}
- Description: ${currentData.description || 'No description'}
- Date: ${currentData.start_date}

Research current findings on:
- Optimal meeting times for different types of business interactions
- Productivity peaks and energy levels throughout the day
- Best practices for client meetings vs. focus work
- Time zone considerations for professional scheduling

Provide 3-4 time suggestions with explanations for why each time would be effective.`;

      const response = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            time_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  reason: { type: "string" },
                  productivity_score: { type: "number", minimum: 1, maximum: 10 }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.time_suggestions || []);
    } catch (error) {
      console.error('Error generating time suggestions:', error);
    }
    setIsLoading(false);
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900 text-base">
          <Wand2 className="w-4 h-4" />
          AI Time Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={generateTimeSuggestions}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
              Analyzing optimal times...
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 mr-2" />
              Suggest Optimal Times
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-blue-800">Recommended Times:</h4>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {suggestion.time}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">{suggestion.productivity_score}/10</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onSuggestion(suggestion.time)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Use This
                  </Button>
                </div>
                <p className="text-xs text-slate-600">{suggestion.reason}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}