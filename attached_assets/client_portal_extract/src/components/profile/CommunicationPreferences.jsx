import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, Calendar } from "lucide-react";

export default function CommunicationPreferences({ client }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Communication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.communication_frequency && (
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm text-slate-600">Update Frequency</div>
              <div className="font-medium text-slate-900 capitalize">{client.communication_frequency}</div>
            </div>
          </div>
        )}

        {client.business_hours_start && client.business_hours_end && (
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm text-slate-600">Business Hours</div>
              <div className="font-medium text-slate-900">
                {client.business_hours_start} - {client.business_hours_end}
              </div>
            </div>
          </div>
        )}

        {client.communication_style && (
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-sm text-slate-600">Style</div>
              <div className="font-medium text-slate-900 capitalize">{client.communication_style}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}