import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, Calendar } from 'lucide-react';

export default function ClientMessaging({ clientId, messages, onRefresh }) {
    const [newMessage, setNewMessage] = useState('');
    const [messageSubject, setMessageSubject] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showComposer, setShowComposer] = useState(false);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            await base44.entities.Message.create({
                client_id: clientId,
                subject: messageSubject || 'Message from Client',
                content: newMessage,
                message_type: 'outgoing',
                sender_name: 'You',
                status: 'read',
                sent_at: new Date().toISOString()
            });
            setNewMessage('');
            setMessageSubject('');
            setShowComposer(false);
            onRefresh();
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setIsSending(false);
    };

    const sortedMessages = [...messages].sort((a, b) => 
        new Date(b.sent_at || b.created_date) - new Date(a.sent_at || a.created_date)
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4">
                    {!showComposer ? (
                        <Button onClick={() => setShowComposer(true)} className="w-full">
                            <Send className="w-4 h-4 mr-2" />
                            Compose New Message
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <Input
                                placeholder="Subject"
                                value={messageSubject}
                                onChange={(e) => setMessageSubject(e.target.value)}
                            />
                            <Textarea
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="h-32"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={isSending || !newMessage.trim()}
                                    className="flex-1"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSending ? 'Sending...' : 'Send Message'}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowComposer(false);
                                        setNewMessage('');
                                        setMessageSubject('');
                                    }}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">Message History</h2>
                {sortedMessages.length > 0 ? (
                    sortedMessages.map((message) => (
                        <Card key={message.id} className={
                            message.message_type === 'incoming' && message.status === 'unread'
                                ? 'border-2 border-blue-200 bg-blue-50/50'
                                : ''
                        }>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg">{message.subject}</CardTitle>
                                            {message.message_type === 'incoming' && message.status === 'unread' && (
                                                <Badge variant="destructive">New</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                                            <span className="font-medium">
                                                {message.message_type === 'incoming' ? 'From Team' : 'You'}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(message.sent_at || message.created_date).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none text-sm text-slate-700 whitespace-pre-wrap">
                                    {message.content}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-slate-500">No messages yet. Start a conversation with your project team!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}