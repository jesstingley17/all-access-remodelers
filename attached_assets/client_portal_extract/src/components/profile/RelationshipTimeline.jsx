import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FolderOpen, StickyNote } from "lucide-react";
import { format } from 'date-fns';

export default function RelationshipTimeline({ client, projects, notes }) {
  const timeline = [
    {
      type: 'client_created',
      date: client.created_date,
      title: 'Client Added',
      description: `${client.company_name} was added to your client list`
    },
    ...projects.map(project => ({
      type: 'project',
      date: project.created_date,
      title: `Project Started: ${project.title}`,
      description: project.description,
      status: project.status
    })),
    ...notes.map(note => ({
      type: 'note',
      date: note.created_date,
      title: 'Note Added',
      description: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getIcon = (type) => {
    switch (type) {
      case 'project': return FolderOpen;
      case 'note': return StickyNote;
      default: return Clock;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Relationship Timeline
      </h3>
      
      <div className="space-y-4">
        {timeline.map((event, index) => {
          const Icon = getIcon(event.type);
          return (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                {index < timeline.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 my-2"></div>
                )}
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900">{event.title}</p>
                  {event.status && (
                    <Badge variant="secondary" className="text-xs">
                      {event.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(event.date), 'PPP')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}