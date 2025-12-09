import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function ManualTimeEntryForm({ projects, tasks, onClose, onSubmit }) {
  const [entryData, setEntryData] = useState({
    project_id: "",
    task_id: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    start_time: "", // e.g., "09:00"
    end_time: "",   // e.g., "10:30"
    is_billable: true,
  });

  const availableTasks = entryData.project_id
    ? tasks.filter(task => task.project_id === entryData.project_id)
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entryData.project_id || !entryData.task_id || !entryData.date || !entryData.start_time || !entryData.end_time) {
      alert("Please fill all required fields.");
      return;
    }

    const startDateTime = new Date(`${entryData.date}T${entryData.start_time}`);
    const endDateTime = new Date(`${entryData.date}T${entryData.end_time}`);
    
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time.");
      return;
    }

    const duration_minutes = (endDateTime - startDateTime) / 60000;
    
    onSubmit({
      project_id: entryData.project_id,
      task_id: entryData.task_id,
      description: entryData.description || tasks.find(t => t.id === entryData.task_id)?.title,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_minutes,
      is_billable: entryData.is_billable,
    });
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Time Entry Manually</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={entryData.project_id} onValueChange={(v) => setEntryData({...entryData, project_id: v, task_id: ""})}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Task *</Label>
              <Select value={entryData.task_id} onValueChange={(v) => setEntryData({...entryData, task_id: v})} disabled={!entryData.project_id}>
                <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
                <SelectContent>{availableTasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={entryData.description} onChange={(e) => setEntryData({...entryData, description: e.target.value})} placeholder="Describe the work done..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={entryData.date} onChange={(e) => setEntryData({...entryData, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input type="time" value={entryData.start_time} onChange={(e) => setEntryData({...entryData, start_time: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input type="time" value={entryData.end_time} onChange={(e) => setEntryData({...entryData, end_time: e.target.value})} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_billable" checked={entryData.is_billable} onCheckedChange={(c) => setEntryData({...entryData, is_billable: c})} />
            <Label htmlFor="is_billable">This time is billable</Label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Entry</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}