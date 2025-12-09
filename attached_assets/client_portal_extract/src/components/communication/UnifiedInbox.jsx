import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, 
  MailOpen, 
  Flag, 
  Reply, 
  Forward, 
  Archive,
  Star,
  Clock,
  User,
  MessageSquare,
  Phone,
  Video,
  Paperclip
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { Message } from "@/api/entities";

import MessageDetailModal from './MessageDetailModal';
import AIReplyAssistant from './AIReplyAssistant';

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  slack: MessageSquare,
  teams: Video,
  linkedin: User,
  twitter: MessageSquare,
  facebook: MessageSquare,
  discord: MessageSquare
};

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  normal: 'bg-slate-100 text-slate-800 border-slate-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
};

const categoryColors = {
  project: 'bg-purple-100 text-purple-800',
  administrative: 'bg-blue-100 text-blue-800',
  promotional: 'bg-green-100 text-green-800',
  support: 'bg-orange-100 text-orange-800',
  social: 'bg-pink-100 text-pink-800',
  other: 'bg-slate-100 text-slate-800'
};

export default function UnifiedInbox({ messages, clients, channels, projects, onMessageUpdate, isLoading }) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const getChannelInfo = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel || { name: 'Unknown', channel_type: 'other' };
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.company_name || 'Unknown Client';
  };

  const handleMarkAsRead = async (message) => {
    if (message.status === 'unread') {
      await Message.update(message.id, { status: 'read' });
      onMessageUpdate({ ...message, status: 'read' });
    }
  };

  const handleToggleFlag = async (message) => {
    const updated = { ...message, is_flagged: !message.is_flagged };
    await Message.update(message.id, { is_flagged: updated.is_flagged });
    onMessageUpdate(updated);
  };

  const handleArchive = async (message) => {
    await Message.update(message.id, { status: 'archived' });
    onMessageUpdate({ ...message, status: 'archived' });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Mail className="w-5 h-5" />
              Unified Inbox
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {messages.length} messages
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAIAssistant(true)}
              >
                AI Assistant
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 animate-pulse">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-64 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="w-16 h-6" />
                </div>
              ))
            ) : messages.length > 0 ? (
              messages.map((message) => {
                const channel = getChannelInfo(message.channel_id);
                const ChannelIcon = channelIcons[channel.channel_type] || Mail;
                
                return (
                  <div 
                    key={message.id}
                    className={`group flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer ${
                      message.status === 'unread' 
                        ? 'border-slate-300 bg-slate-50/50' 
                        : 'border-slate-200'
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      handleMarkAsRead(message);
                    }}
                  >
                    {/* Channel Icon & Status */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.status === 'unread' ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <ChannelIcon className={`w-5 h-5 ${
                          message.status === 'unread' ? 'text-blue-600' : 'text-slate-600'
                        }`} />
                      </div>
                      {message.is_flagged && (
                        <Flag className="w-3 h-3 text-amber-500 fill-current" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium truncate ${
                          message.status === 'unread' ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {message.sender_name || 'Unknown Sender'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {getClientName(message.client_id)}
                        </span>
                        {message.attachments && message.attachments.length > 0 && (
                          <Paperclip className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                      
                      <div className={`text-sm mb-2 ${
                        message.status === 'unread' ? 'text-slate-900' : 'text-slate-600'
                      }`}>
                        {message.subject && (
                          <span className="font-medium">{message.subject}</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-slate-500 line-clamp-2 mb-2">
                        {message.content}
                      </div>

                      <div className="flex items-center gap-2">
                        {message.priority !== 'normal' && (
                          <Badge className={`text-xs ${priorityColors[message.priority]}`}>
                            {message.priority}
                          </Badge>
                        )}
                        {message.category && (
                          <Badge className={`text-xs ${categoryColors[message.category]}`}>
                            {message.category}
                          </Badge>
                        )}
                        {message.ai_analysis?.sentiment && (
                          <Badge variant="outline" className="text-xs">
                            {message.ai_analysis.sentiment} sentiment
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Time & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(message.received_at), { addSuffix: true })}
                      </span>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFlag(message);
                          }}
                        >
                          <Flag className={`w-3 h-3 ${message.is_flagged ? 'text-amber-500 fill-current' : 'text-slate-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(message);
                          }}
                        >
                          <Archive className="w-3 h-3 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No messages found</h3>
                <p>Your unified inbox is empty or all messages match your current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          clients={clients}
          channels={channels}
          projects={projects}
          onClose={() => setSelectedMessage(null)}
          onUpdate={onMessageUpdate}
        />
      )}

      {/* AI Reply Assistant */}
      {showAIAssistant && (
        <AIReplyAssistant
          messages={messages}
          clients={clients}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
}