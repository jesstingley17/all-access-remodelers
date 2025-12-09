import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, ArrowRight, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const statusColors = {
  todo: "bg-slate-100 text-slate-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800"
};

export default function ProjectTasksList({ tasks, projectId }) {
  const upcomingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <ListTodo className="w-5 h-5" />
          Project Tasks
        </CardTitle>
        <Link to={createPageUrl(`Tasks?project_id=${projectId}`)}>
          <Button variant="outline" size="sm">
            View All Tasks
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <div key={task.id} className="p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">{task.title}</p>
                  {task.due_date && (
                    <p className="text-xs text-slate-500">
                      Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <Badge className={`capitalize ${statusColors[task.status]}`}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No upcoming tasks for this project.</p>
            <p className="text-sm mt-1">You can add tasks from the main Tasks page.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}