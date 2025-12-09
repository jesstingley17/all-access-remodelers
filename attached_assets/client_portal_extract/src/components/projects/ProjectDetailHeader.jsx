import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Wand2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  on_hold: "bg-amber-100 text-amber-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusOptions = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

export default function ProjectDetailHeader({ project, client, onUpdate, onOpenAudit, onOpenFeedback }) {
  const handleStatusChange = (newStatus) => {
    onUpdate({ status: newStatus });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border-0">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{project.title}</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-slate-600 font-medium">Client: {client?.company_name || 'N/A'}</span>
            <span className="text-slate-600 font-medium">Due: {project.due_date ? format(new Date(project.due_date), 'MMM d, yyyy') : 'N/A'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={project.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Set status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <Badge className={`${statusColors[option.value]} mr-2`}>{option.label}</Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white" onClick={onOpenAudit}>
            <Wand2 className="w-4 h-4 mr-2" />
            Strategic Audit
          </Button>
          {project.status === 'completed' && onOpenFeedback && (
            <Button variant="outline" className="bg-white" onClick={onOpenFeedback}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Give Feedback
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}