import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  FileText, 
  Calendar,
  Clock,
  User
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const noteTypeIcons = {
  general: MessageSquare,
  meeting: Calendar,
  project: FileText,
  feedback: MessageSquare,
  milestone: Calendar
};

const noteTypeColors = {
  general: "bg-blue-100 text-blue-800",
  meeting: "bg-purple-100 text-purple-800",
  project: "bg-emerald-100 text-emerald-800",
  feedback: "bg-amber-100 text-amber-800",
  milestone: "bg-rose-100 text-rose-800"
};

export default function RecentActivity({ notes, isLoading }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg border border-slate-200 animate-pulse">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                  <Skeleton className="h-3 w-1/4 mt-2" />
                </div>
              </div>
            ))
          ) : notes.length > 0 ? (
            notes.map((note) => {
              const IconComponent = noteTypeIcons[note.note_type] || MessageSquare;
              return (
                <div key={note.id} className="flex gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    noteTypeColors[note.note_type] || 'bg-slate-100 text-slate-600'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{note.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {note.note_type}
                      </Badge>
                      {note.is_important && (
                        <Badge className="bg-red-100 text-red-800 text-xs">Important</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <User className="w-3 h-3" />
                      <span>{note.created_by}</span>
                      <span>•</span>
                      <span>{format(new Date(note.created_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No recent activity. Start adding notes to track your client interactions.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}