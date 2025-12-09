import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Settings, 
  Wifi, 
  WifiOff, 
  Mail,
  MessageSquare,
  Phone,
  Video,
  Users,
  Twitter,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { CommunicationChannel } from "@/api/entities";
import { format } from 'date-fns';

const channelIcons = {
  email: Mail,
  sms: Phone,
  whatsapp: MessageSquare,
  slack: MessageSquare,
  teams: Video,
  linkedin: Users,
  twitter: Twitter,
  facebook: Users,
  discord: MessageSquare
};

const statusColors = {
  connected: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  disconnected: { bg: 'bg-red-100', text: 'text-red-800', icon: WifiOff },
  error: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock }
};

export default function ChannelManager({ channels, onChannelUpdate }) {
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const handleToggleChannel = async (channel) => {
    try {
      await CommunicationChannel.update(channel.id, { is_active: !channel.is_active });
      onChannelUpdate();
    } catch (error) {
      console.error("Error toggling channel:", error);
    }
  };

  const handleSyncChannel = async (channel) => {
    try {
      await CommunicationChannel.update(channel.id, { 
        last_sync: new Date().toISOString(),
        connection_status: 'connected' 
      });
      onChannelUpdate();
    } catch (error) {
      console.error("Error syncing channel:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Settings className="w-5 h-5" />
              Communication Channels
            </CardTitle>
            <Button onClick={() => setIsAddingChannel(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Manage your communication channels and sync settings. Connect your email accounts, messaging apps, and social media to centralize all client communications.
          </p>
        </CardContent>
      </Card>

      {/* Channel List */}
      <div className="grid gap-4">
        {channels.map((channel) => {
          const ChannelIcon = channelIcons[channel.channel_type] || MessageSquare;
          const statusConfig = statusColors[channel.connection_status];
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={channel.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Channel Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      channel.is_active ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <ChannelIcon className={`w-6 h-6 ${
                        channel.is_active ? 'text-blue-600' : 'text-slate-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{channel.name}</h3>
                        <Badge className={`text-xs ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {channel.connection_status}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {channel.channel_type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{channel.provider}</span>
                        {channel.last_sync && (
                          <span>
                            Last sync: {format(new Date(channel.last_sync), 'MMM d, HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Channel Actions */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">Active</span>
                      <Switch
                        checked={channel.is_active}
                        onCheckedChange={() => handleToggleChannel(channel)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncChannel(channel)}
                        disabled={!channel.is_active}
                      >
                        <Wifi className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Channel Settings Preview */}
                {channel.settings && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Auto Sync:</span>
                        <Badge variant={channel.settings.auto_sync ? "default" : "secondary"} className="text-xs">
                          {channel.settings.auto_sync ? "On" : "Off"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Notifications:</span>
                        <Badge variant={channel.settings.notification_enabled ? "default" : "secondary"} className="text-xs">
                          {channel.settings.notification_enabled ? "On" : "Off"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Priority:</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {channel.settings.priority_level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Channel Instructions */}
      {channels.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No communication channels connected</h3>
            <p className="text-slate-500 mb-6">
              Connect your email accounts, messaging apps, and social media to start managing all your client communications in one place.
            </p>
            <Button onClick={() => setIsAddingChannel(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Channel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}