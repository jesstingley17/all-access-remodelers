import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Copy, CheckCircle } from 'lucide-react';

export default function DocumentSummarizer({ document, onClose }) {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const prompt = `You are a professional document analysis expert. Analyze and summarize the following document comprehensively.

Document Name: ${document.document_name}
Document Type: ${document.document_type}
${document.description ? `Description: ${document.description}` : ''}

Provide a structured summary with:
1. **Executive Summary**: Brief overview (2-3 sentences)
2. **Key Points**: Main topics and important details (bullet points)
3. **Action Items**: Any tasks, deadlines, or next steps mentioned
4. **Important Dates**: Critical dates or timelines
5. **Parties Involved**: Key stakeholders or entities mentioned

Be thorough but concise. Focus on actionable insights and critical information.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setSummary(response);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Document Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">{document.document_name}</p>
                <p className="text-xs text-slate-600">Type: {document.document_type}</p>
                {document.version && (
                  <p className="text-xs text-slate-600">Version: {document.version}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {isGenerating ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-slate-600">Analyzing document and generating summary...</p>
                <p className="text-sm text-slate-500 mt-2">This may take a moment</p>
              </CardContent>
            </Card>
          ) : summary ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Summary</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {summary}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={generateSummary} disabled={isGenerating}>
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}