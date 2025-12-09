import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2, Copy, Send } from 'lucide-react';

export default function AIProjectStatusGenerator({ project, tasks, timeEntries, client }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const generateStatusUpdate = async () => {
        setIsGenerating(true);
        try {
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
            const upcomingTasks = tasks.filter(t => t.status === 'todo').length;
            const overdueTasks = tasks.filter(t => 
                t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
            ).length;

            const totalHours = timeEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60;
            const recentTasks = tasks.filter(t => t.status === 'completed')
                .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
                .slice(0, 5);

            const daysUntilDeadline = project.end_date_target
                ? Math.ceil((new Date(project.end_date_target) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

            const prompt = `Generate a professional, client-friendly project status update for a construction project.

Project: ${project.name}
Client: ${client?.company_name || 'Client'}
Status: ${project.status}
Target Completion: ${project.end_date_target ? new Date(project.end_date_target).toLocaleDateString() : 'TBD'}
Days Until Deadline: ${daysUntilDeadline || 'N/A'}

Progress Metrics:
- Total Tasks: ${tasks.length}
- Completed: ${completedTasks} (${tasks.length > 0 ? ((completedTasks/tasks.length)*100).toFixed(0) : 0}%)
- In Progress: ${inProgressTasks}
- Upcoming: ${upcomingTasks}
- Overdue: ${overdueTasks}
- Total Hours Logged: ${totalHours.toFixed(1)}h

Recently Completed:
${recentTasks.map(t => `- ${t.title}`).join('\n')}

Budget: ${project.budget ? `$${project.budget.toLocaleString()}` : 'Not specified'}

Create a concise, professional status update that:
- Opens with a positive, reassuring tone
- Highlights key accomplishments since last update
- Mentions current progress percentage
- Notes any tasks in progress
- ${overdueTasks > 0 ? 'Addresses delays honestly but positively, with mitigation steps' : 'Confirms project is on schedule'}
- Previews upcoming milestones
- ${daysUntilDeadline && daysUntilDeadline <= 30 ? 'Mentions approaching completion date' : ''}
- Ends with an invitation for questions or site visit
- Keep it to 4-5 short paragraphs
- Use clear, non-technical language

Return only the message text, no subject line.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false
            });

            setMessage(response);
        } catch (error) {
            console.error('Error generating status update:', error);
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
                subject: `${project.name} - Project Status Update`,
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
                    <FileText className="w-5 h-5 text-green-600" />
                    AI Project Status Update Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!message ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">
                            Generate a professional status update for your client based on current progress
                        </p>
                        <Button onClick={generateStatusUpdate} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generate Update
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Generated Status Update:</label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={12}
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
                                Send to Client
                            </Button>
                        </div>

                        <Button variant="ghost" onClick={generateStatusUpdate} size="sm" className="w-full">
                            Regenerate
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}