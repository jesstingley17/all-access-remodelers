import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Reply, 
  Forward, 
  Archive, 
  Flag,
  Download,
  User,
  Calendar,
  Paperclip,
  Send
} from "lucide-react";
import { format } from 'date-fns';
import { Message } from "@/api/entities";

export default function MessageDetailModal({ message, clients, channels, projects, onClose, onUpdate }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const client = clients.find(c => c.id === message.client_id);
  const channel = channels.find(c => c.id === message.channel_id);
  const project = projects.find(p => p.id === message.project_id);

  const handleToggleFlag = async () => {
    const updated = { ...message, is_flagged: !message.is_flagged };
    await Message.update(message.id, { is_flagged: updated.is_flagged });
    onUpdate(updated);
  };

  const handleArchive = async () => {
    await Message.update(message.id, { status: 'archived' });
    onUpdate({ ...message, status: 'archived' });
    onClose();
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    
    setIsSending(true);
    try {
      // Create reply message
      const replyData = {
        channel_id: message.channel_id,
        client_id: message.client_id,
        project_id: message.project_id,
        thread_id: message.thread_id,
        subject: `Re: ${message.subject}`,
        content: replyContent,
        message_type: 'outgoing',
        sender_email: 'your@email.com', // This would come from user settings
        sender_name: 'Your Name',
        recipient_email: message.sender_email,
        recipient_name: message.sender_name,
        sent_at: new Date().toISOString(),
        received_at: new Date().toISOString(),
        status: 'read'
      };
      
      await Message.create(replyData);
      
      // Update original message status
      await Message.update(message.id, { status: 'replied' });
      onUpdate({ ...message, status: 'replied' });
      
      setIsReplying(false);
      setReplyContent('');
      onClose();
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply. Please try again.");
    }
    setIsSending(false);
  };

  const priorityColors = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    normal: 'bg-slate-100 text-slate-800',
    low: 'bg-blue-100 text-blue-800'
  };

  const categoryColors = {
    project: 'bg-purple-100 text-purple-800',
    administrative: 'bg-blue-100 text-blue-800',
    promotional: 'bg-green-100 text-green-800',
    support: 'bg-orange-100 text-orange-800',
    social: 'bg-pink-100 text-pink-800',
    other: 'bg-slate-100 text-slate-800'
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-slate-900 mb-2">
                {message.subject || 'No Subject'}
              </DialogTitle>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{message.sender_name}</span>
                  <span className="text-slate-500">({message.sender_email})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{format(new Date(message.received_at), 'MMM d, yyyy at HH:mm')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFlag}
              >
                <Flag className={`w-4 h-4 ${message.is_flagged ? 'text-amber-500 fill-current' : 'text-slate-400'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleArchive}
              >
                <Archive className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Message Metadata */}
          <div className="flex flex-wrap gap-2">
            {message.priority !== 'normal' && (
              <Badge className={priorityColors[message.priority]}>
                {message.priority} priority
              </Badge>
            )}
            {message.category && (
              <Badge className={categoryColors[message.category]}>
                {message.category}
              </Badge>
            )}
            {channel && (
              <Badge variant="outline">
                {channel.name} ({channel.channel_type})
              </Badge>
            )}
            {client && (
              <Badge variant="outline">
                {client.company_name}
              </Badge>
            )}
            {project && (
              <Badge variant="outline">
                Project: {project.title}
              </Badge>
            )}
          </div>

          {/* AI Analysis */}
          {message.ai_analysis && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">AI Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700">Sentiment:</span>
                  <Badge className={`text-xs ${
                    message.ai_analysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    message.ai_analysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {message.ai_analysis.sentiment}
                  </Badge>
                </div>
                {message.ai_analysis.key_topics && message.ai_analysis.key_topics.length > 0 && (
                  <div>
                    <span className="text-blue-700">Key Topics: </span>
                    {message.ai_analysis.key_topics.join(', ')}
                  </div>
                )}
                {message.ai_analysis.action_items && message.ai_analysis.action_items.length > 0 && (
                  <div>
                    <span className="text-blue-700 font-medium">Action Items:</span>
                    <ul className="list-disc list-inside mt-1 ml-4">
                      {message.ai_analysis.action_items.map((item, index) => (
                        <li key={index} className="text-blue-800">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message Content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
              {message.content}
            </div>
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments
              </h4>
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{attachment.filename}</div>
                      <div className="text-xs text-slate-500">
                        {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Section */}
          {isReplying && (
            <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-700">Reply</h4>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply..."
                rows={6}
                className="resize-none"
              />
              <div className="flex items-center justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsReplying(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendReply}
                  disabled={isSending || !replyContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isReplying && (
          <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsReplying(true)}
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </Button>
              <Button variant="outline">
                <Forward className="w-4 h-4 mr-2" />
                Forward
              </Button>
            </div>
            
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}