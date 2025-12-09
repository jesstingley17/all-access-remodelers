import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react';

export default function AICustomerChatbot({ clientEmail, jobs, clients }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m here to help with your cleaning service inquiries. You can ask me about job status, scheduling, or any questions you have.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        try {
            const client = clients.find(c => c.email === clientEmail);
            const clientJobs = jobs.filter(j => j.client_id === client?.id);
            
            const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');

            const prompt = `You are a helpful customer service AI assistant for a professional cleaning service company. 

Client Information:
${client ? `
- Name: ${client.name}
- Type: ${client.type}
- Status: ${client.status}
- Email: ${client.email}
` : 'Client information not available'}

Client's Jobs (${clientJobs.length} total):
${clientJobs.slice(0, 10).map(j => `
- Status: ${j.status}
- Scheduled: ${new Date(j.scheduled_start_at).toLocaleString()}
- Location: ${j.client_location_id}
- Price: $${j.price_quote || 'N/A'}
${j.completed_at ? `- Completed: ${new Date(j.completed_at).toLocaleString()}` : ''}
`).join('\n')}

Conversation History:
${conversationHistory}

Customer's Question: ${userMessage}

Provide a helpful, professional, and friendly response. Be specific when discussing job details. For scheduling requests, acknowledge them and mention a team member will confirm. For troubleshooting, provide clear step-by-step guidance. Keep responses concise but informative.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: false
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'I apologize, but I\'m having trouble processing your request. Please try again or contact our support team directly.' 
            }]);
        }
        setIsTyping(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Customer Support Chat
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message, idx) => (
                        <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                                }`}>
                                    {message.role === 'user' ? (
                                        <User className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-purple-600" />
                                    )}
                                </div>
                                <div className={`rounded-lg p-3 ${
                                    message.role === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-slate-100 text-slate-900'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="bg-slate-100 rounded-lg p-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your jobs, scheduling, or any questions..."
                        disabled={isTyping}
                    />
                    <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}