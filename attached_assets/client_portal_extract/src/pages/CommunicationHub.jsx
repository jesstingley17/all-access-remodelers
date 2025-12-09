import React, { useState, useEffect } from "react";
import { Message } from "@/api/entities";
import { CommunicationChannel } from "@/api/entities";
import { Client } from "@/api/entities";
import { Project } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Plus, 
  Search,
  Filter,
  Mail,
  Phone,
  Video,
  Settings
} from "lucide-react";

import UnifiedInbox from "../components/communication/UnifiedInbox";
import MessageComposer from "../components/communication/MessageComposer";
import CommunicationStats from "../components/communication/CommunicationStats";
import ChannelManager from "../components/communication/ChannelManager";

export default function CommunicationHub() {
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [messagesData, channelsData, clientsData, projectsData] = await Promise.all([
        Message.list("-received_at", 100),
        CommunicationChannel.list("-last_sync"),
        Client.list(),
        Project.list()
      ]);
      setMessages(messagesData || []);
      setChannels(channelsData || []);
      setClients(clientsData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error("Error loading communication data:", error);
      setMessages([]);
      setChannels([]);
      setClients([]);
      setProjects([]);
    }
    setIsLoading(false);
  };

  const handleMessageUpdate = (updatedMessage) => {
    setMessages(prev => prev.map(msg => 
      msg.id === updatedMessage.id ? updatedMessage : msg
    ));
  };

  const handleNewMessage = (newMessage) => {
    setMessages(prev => [newMessage, ...prev]);
    loadData();
  };

  const filteredMessages = messages.filter(msg => {
    const searchMatch = searchTerm === '' || 
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const channelMatch = selectedChannel === 'all' || msg.channel_id === selectedChannel;
    const clientMatch = selectedClient === 'all' || msg.client_id === selectedClient;
    
    return searchMatch && channelMatch && clientMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Communication Hub</h1>
            <p className="text-slate-600 mt-1 font-medium">Centralized client communication management</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant={activeView === 'channels' ? 'default' : 'outline'}
              onClick={() => setActiveView('channels')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Channels
            </Button>
            <Button 
              variant={activeView === 'compose' ? 'default' : 'outline'}
              onClick={() => setActiveView('compose')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </Button>
            <Button 
              variant={activeView === 'inbox' ? 'default' : 'outline'}
              onClick={() => setActiveView('inbox')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Inbox
            </Button>
          </div>
        </div>

        {/* Communication Stats */}
        <CommunicationStats 
          messages={messages} 
          channels={channels}
          isLoading={isLoading} 
        />

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2 block">
                    Search Messages
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2 block">
                    Channel
                  </label>
                  <select 
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white"
                  >
                    <option value="all">All Channels</option>
                    {channels.map(channel => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name} ({channel.channel_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2 block">
                    Client
                  </label>
                  <select 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white"
                  >
                    <option value="all">All Clients</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Mail className="w-3 h-3 mr-2" />
                      Unread Messages ({messages.filter(m => m.status === 'unread').length})
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Phone className="w-3 h-3 mr-2" />
                      Flagged Messages ({messages.filter(m => m.is_flagged).length})
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Video className="w-3 h-3 mr-2" />
                      Urgent Messages ({messages.filter(m => m.priority === 'urgent').length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeView === 'inbox' && (
              <UnifiedInbox 
                messages={filteredMessages}
                clients={clients}
                channels={channels}
                projects={projects}
                onMessageUpdate={handleMessageUpdate}
                isLoading={isLoading}
              />
            )}
            {activeView === 'compose' && (
              <MessageComposer 
                clients={clients}
                projects={projects}
                channels={channels}
                onMessageSent={handleNewMessage}
              />
            )}
            {activeView === 'channels' && (
              <ChannelManager 
                channels={channels}
                onChannelUpdate={loadData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}