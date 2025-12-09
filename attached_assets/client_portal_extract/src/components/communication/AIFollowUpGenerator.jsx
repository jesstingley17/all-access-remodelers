import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Loader2, Copy, Send } from 'lucide-react';

export default function AIFollowUpGenerator({ job, client, feedback }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const generateFollowUp = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Generate a warm, professional follow-up message for a cleaning service client.

Job Details:
- Completed: ${new Date(job.completed_at || job.scheduled_start_at).toLocaleDateString()}
- Service Type: ${job.service_type_id}
- Location: ${job.client_location_id}

Client: ${client?.name || 'Valued Customer'}

${feedback ? `Client Feedback: ${feedback.rating}/5 stars${feedback.comment ? ` - "${feedback.comment}"` : ''}` : 'No feedback received yet'}

Create a personalized follow-up message that:
- Thanks them for choosing our service
- ${feedback?.rating >= 4 ? 'Acknowledges their positive feedback' : feedback?.rating ? 'Addresses any concerns and shows commitment to improvement' : 'Asks for their feedback'}
- ${feedback?.rating >= 4 ? 'Invites them to refer friends/family' : ''}
- Mentions our booking system for future appointments
- Keeps a friendly, professional tone
- Is 3-4 sentences max

Return only the message text, no subject line or greeting.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false
            });

            setMessage(response);
        } catch (error) {
            console.error('Error generating follow-up:', error);
        }
        setIsGenerating(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
    };

    const sendMessage = async () => {
        if (!client?.email || !message) return;
        
        setIsSending(true);
        try {
            await base44.integrations.Core.SendEmail({
                to: client.email,
                subject: 'Thank You for Choosing Our Cleaning Service',
                body: message
            });
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setIsSending(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    AI Follow-Up Message Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!message ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Generate a personalized follow-up message for this client
                        </p>
                        <Button onClick={generateFollowUp} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Generate Message
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Generated Message:</label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={6}
                                className="resize-none"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </Button>
                            <Button onClick={sendMessage} disabled={isSending || !client?.email} className="flex-1">
                                {isSending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                Send Email
                            </Button>
                        </div>

                        <Button variant="ghost" onClick={generateFollowUp} size="sm" className="w-full">
                            Regenerate
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}