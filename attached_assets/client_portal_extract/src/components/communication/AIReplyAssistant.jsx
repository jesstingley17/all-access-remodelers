import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, 
  Copy, 
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Lightbulb
} from "lucide-react";
import { InvokeLLM } from '@/api/integrations';

export default function AIReplyAssistant({ message, client, project, onReplySelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const generateReplies = async (tone = 'professional') => {
    setIsGenerating(true);
    try {
      const prompt = `You are a professional communication expert. Generate 3 different reply options for this client message, using current business communication best practices.

Original Message:
Subject: ${message.subject || 'No subject'}
From: ${message.sender_name} (${client?.company_name})
Content: ${message.content}

Client Context:
- Company: ${client?.company_name || 'Unknown'}
- Industry: ${client?.industry || 'Not specified'}
- Relationship: ${client?.relationship_status || 'Unknown'}
${project ? `- Current Project: ${project.title}` : ''}

Generate replies with these tones:
1. Professional and formal
2. Friendly but professional  
3. Concise and direct

Research current business communication trends to ensure responses are appropriate and effective. Each reply should be complete and ready to send.`;

      const response = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            replies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tone: { type: "string" },
                  content: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.replies || []);
    } catch (error) {
      console.error('Error generating replies:', error);
    }
    setIsGenerating(false);
  };

  const generateCustomReply = async () => {
    if (!customPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const prompt = `You are a professional communication expert. Based on this specific request, generate an appropriate reply to this client message using current business communication standards.

Original Message:
Subject: ${message.subject || 'No subject'}
From: ${message.sender_name} (${client?.company_name})
Content: ${message.content}

Specific Request: ${customPrompt}

Client Context:
- Company: ${client?.company_name || 'Unknown'}
- Industry: ${client?.industry || 'Not specified'}
${project ? `- Current Project: ${project.title}` : ''}

Research current business communication trends and generate a professional, appropriate response that addresses the specific request while maintaining professional standards.`;

      const response = await InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setSuggestions([{
        tone: 'Custom',
        content: response,
        reasoning: 'Generated based on your specific requirements'
      }]);
      setCustomPrompt('');
    } catch (error) {
      console.error('Error generating custom reply:', error);
    }
    setIsGenerating(false);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Wand2 className="w-5 h-5" />
          AI Reply Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => generateReplies('professional')}
            disabled={isGenerating}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Generate Replies
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => generateReplies()}
            disabled={isGenerating}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh Suggestions
          </Button>
        </div>

        {/* Custom Request */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Custom Reply Request:</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="e.g., 'Politely decline and suggest alternative timeline' or 'Ask for more details about budget'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={generateCustomReply}
              disabled={isGenerating || !customPrompt.trim()}
              size="sm"
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Generating intelligent replies...</span>
          </div>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Suggested Replies:</h4>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    {suggestion.tone}
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onReplySelect(suggestion.content)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Use This
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {suggestion.content}
                </p>
                {suggestion.reasoning && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    {suggestion.reasoning}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !isGenerating && (
          <div className="text-center py-6 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Click "Generate Replies" to get AI-powered response suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}