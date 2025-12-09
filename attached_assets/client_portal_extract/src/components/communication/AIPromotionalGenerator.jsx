import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Copy, Send } from 'lucide-react';

export default function AIPromotionalGenerator({ clients, jobs, services }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedClient, setSelectedClient] = useState('');
    const [promoType, setPromoType] = useState('seasonal');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const generatePromotion = async () => {
        if (!selectedClient) return;

        const client = clients.find(c => c.id === selectedClient);
        const clientJobs = jobs.filter(j => j.client_id === selectedClient);
        const lastJob = clientJobs.sort((a, b) => new Date(b.scheduled_start_at) - new Date(a.scheduled_start_at))[0];
        
        setIsGenerating(true);
        try {
            const prompt = `Generate a personalized promotional message for a cleaning service client.

Client: ${client?.name}
Client Type: ${client?.type}
Total Jobs: ${clientJobs.length}
Last Service: ${lastJob ? new Date(lastJob.scheduled_start_at).toLocaleDateString() : 'Never'}
Available Services: ${services.map(s => s.name).join(', ')}

Promotion Type: ${promoType}

Create a personalized promotional message that:
${promoType === 'seasonal' ? '- Highlights seasonal cleaning needs (spring cleaning, holiday prep, etc.)' : ''}
${promoType === 'loyalty' ? '- Thanks them for being a valued repeat customer' : ''}
${promoType === 'referral' ? '- Offers a referral discount for bringing new clients' : ''}
${promoType === 'upsell' ? '- Suggests additional services they haven\'t tried yet' : ''}
- Includes a special offer or discount
- Uses their service history to make it personal
- Keeps a friendly, non-pushy tone
- Is 3-4 sentences max
- Includes a clear call-to-action

Return only the message text.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false
            });

            setMessage(response);
        } catch (error) {
            console.error('Error generating promotion:', error);
        }
        setIsGenerating(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
    };

    const sendMessage = async () => {
        const client = clients.find(c => c.id === selectedClient);
        if (!client?.email || !message) return;
        
        setIsSending(true);
        try {
            await base44.integrations.Core.SendEmail({
                to: client.email,
                subject: 'Special Offer Just for You!',
                body: message
            });
            setMessage('');
            setSelectedClient('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setIsSending(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Promotional Message Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!message ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Client</label>
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.filter(c => c.status === 'active').map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name} ({client.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Promotion Type</label>
                            <Select value={promoType} onValueChange={setPromoType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="seasonal">Seasonal Offer</SelectItem>
                                    <SelectItem value="loyalty">Loyalty Reward</SelectItem>
                                    <SelectItem value="referral">Referral Program</SelectItem>
                                    <SelectItem value="upsell">Service Upsell</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={generatePromotion} disabled={!selectedClient || isGenerating} className="w-full">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Promotion
                                </>
                            )}
                        </Button>
                    </>
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
                            <Button onClick={sendMessage} disabled={isSending} className="flex-1">
                                {isSending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                Send Email
                            </Button>
                        </div>

                        <Button variant="ghost" onClick={() => setMessage('')} size="sm" className="w-full">
                            Create New
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}