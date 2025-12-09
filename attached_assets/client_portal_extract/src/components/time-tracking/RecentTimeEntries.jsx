import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from '@/components/ui/skeleton';

export default function RecentTimeEntries({ timeEntries, projects, tasks, onUpdate, onDelete, isLoading }) {
  const getProjectName = (id) => projects.find(p => p.id === id)?.title || 'N/A';
  const getTaskName = (id) => tasks.find(t => t.id === id)?.title || 'N/A';

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle>Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Billable</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : (
              timeEntries.slice(0, 10).map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.start_time), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{getProjectName(entry.project_id)}</TableCell>
                  <TableCell>{getTaskName(entry.task_id)}</TableCell>
                  <TableCell className="font-medium">{formatDuration(entry.duration_minutes)}</TableCell>
                  <TableCell>{`${format(new Date(entry.start_time), 'HH:mm')} - ${format(new Date(entry.end_time), 'HH:mm')}`}</TableCell>
                  <TableCell>
                    <Badge variant={entry.is_billable ? "default" : "outline"}>
                      {entry.is_billable ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDelete(entry.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading && timeEntries.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            No time entries yet. Start the timer or add an entry manually.
          </div>
        )}
      </CardContent>
    </Card>
  );
}