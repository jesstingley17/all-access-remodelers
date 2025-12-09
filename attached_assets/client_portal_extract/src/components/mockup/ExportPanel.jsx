import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExportPanel({ mockups, annotations }) {
    const [exportFormat, setExportFormat] = useState('pdf');
    const [clientEmail, setClientEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [success, setSuccess] = useState(null);

    const handleExportAll = async () => {
        setIsExporting(true);
        try {
            // Download all mockups as individual files
            for (let i = 0; i < mockups.length; i++) {
                const mockup = mockups[i];
                const link = document.createElement('a');
                link.href = mockup.url;
                link.download = `mockup-${i + 1}-${mockup.device.toLowerCase()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            setSuccess('All mockups exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleSendToClient = async () => {
        if (!clientEmail) return;
        
        setIsSending(true);
        try {
            const mockupLinks = mockups.map((m, i) => 
                `${i + 1}. ${m.style} (${m.device}): ${m.url}`
            ).join('\n');

            const emailBody = `
Hello,

${message || 'Please review the website mockups we\'ve created for you.'}

Mockup Links:
${mockupLinks}

${annotations && Object.keys(annotations).length > 0 ? 
    `\nNote: Some mockups include feedback annotations.` : ''}

Best regards
            `.trim();

            await base44.integrations.Core.SendEmail({
                to: clientEmail,
                subject: 'Your Website Mockups for Review',
                body: emailBody
            });

            setSuccess('Mockups sent to client successfully!');
            setClientEmail('');
            setMessage('');
        } catch (error) {
            console.error('Send failed:', error);
            setSuccess('Failed to send email. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Export & Share</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {success && (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-3">Export All Mockups</h3>
                        <Button
                            onClick={handleExportAll}
                            disabled={isExporting}
                            className="w-full"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download All Mockups
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                            Downloads all {mockups.length} mockups as PNG files
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Send to Client</h3>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="clientEmail">Client Email</Label>
                                <Input
                                    id="clientEmail"
                                    type="email"
                                    placeholder="client@example.com"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="message">Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Add a personal message to your client..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="h-24"
                                />
                            </div>
                            <Button
                                onClick={handleSendToClient}
                                disabled={!clientEmail || isSending}
                                className="w-full"
                                variant="secondary"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send via Email
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}