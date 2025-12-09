import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Flag
} from "lucide-react";

export default function CommunicationStats({ messages, channels, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    totalMessages: messages.length,
    unreadCount: messages.filter(m => m.status === 'unread').length,
    flaggedCount: messages.filter(m => m.is_flagged).length,
    urgentCount: messages.filter(m => m.priority === 'urgent' || m.priority === 'high').length,
    responseRate: messages.length > 0 ? ((messages.filter(m => m.status === 'replied').length / messages.length) * 100).toFixed(1) : 0,
    activeChannels: channels.filter(c => c.is_active && c.connection_status === 'connected').length
  };

  const statCards = [
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${stats.activeChannels} active channels`
    },
    {
      title: 'Unread',
      value: stats.unreadCount,
      icon: MessageSquare,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      description: 'Require attention'
    },
    {
      title: 'Flagged',
      value: stats.flaggedCount,
      icon: Flag,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Important messages'
    },
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'Last 30 days'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  {stat.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    {stat.value}
                  </div>
                  {stat.title === 'Unread' && stats.urgentCount > 0 && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {stats.urgentCount} urgent
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {stat.description}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} bg-opacity-15 backdrop-blur-sm`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}