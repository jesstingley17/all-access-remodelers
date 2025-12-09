import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function CalendarConnections({ onSync }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await base44.functions.invoke('checkGoogleCalendarConnection');
      setIsConnected(response.data.connected);
    } catch (error) {
      setIsConnected(false);
    }
    setIsChecking(false);
  };

  const handleConnect = () => {
    const connectUrl = base44.agents.getWhatsAppConnectURL('googlecalendar');
    window.open(connectUrl, '_blank');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await base44.functions.invoke('syncGoogleCalendar');
      if (onSync) onSync();
    } catch (error) {
      console.error('Error syncing calendar:', error);
    }
    setIsSyncing(false);
  };

  if (isChecking) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50">
        <CardContent className="p-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          <span className="text-sm text-slate-600">Checking calendar connections...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Calendar Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Google Calendar</p>
              <p className="text-xs text-slate-500">Sync events with Google</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <Button 
                  size="sm" 
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Sync Now'
                  )}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleConnect}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4 text-blue-800" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Outlook Calendar</p>
              <p className="text-xs text-slate-500">Coming soon</p>
            </div>
          </div>
          <Badge variant="outline" className="text-slate-500">Soon</Badge>
        </div>
      </CardContent>
    </Card>
  );
}