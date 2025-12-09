import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Event } from "@/api/entities";
import { format, parseISO } from "date-fns";
import AITimeSuggest from "./AITimeSuggest";

export default function EventModal({ event, selectedDate, onClose, projects }) {
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start_date: format(parseISO(event.start_time), 'yyyy-MM-dd'),
        start_time_str: format(parseISO(event.start_time), 'HH:mm'),
        end_date: format(parseISO(event.end_time), 'yyyy-MM-dd'),
        end_time_str: format(parseISO(event.end_time), 'HH:mm'),
      });
    } else if (selectedDate) {
      setFormData({
        title: "",
        description: "",
        event_type: "meeting",
        all_day: false,
        start_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time_str: "09:00",
        end_date: format(selectedDate, 'yyyy-MM-dd'),
        end_time_str: "10:00",
        project_id: "",
        attendees: [],
      });
    }
  }, [event, selectedDate]);
  
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { start_date, start_time_str, end_date, end_time_str, ...data } = formData;
    
    const submissionData = {
        ...data,
        start_time: `${start_date}T${start_time_str}:00`,
        end_time: `${end_date}T${end_time_str}:00`,
    };

    try {
        if (event) {
            await Event.update(event.id, submissionData);
        } else {
            await Event.create(submissionData);
        }
        onClose();
    } catch(e) {
        console.error("Error submitting event:", e);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={formData.event_type} onValueChange={(v) => handleChange('event_type', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="focus_time">Focus Time</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Project</Label>
                 <Select value={formData.project_id} onValueChange={(v) => handleChange('project_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Link to a project"/></SelectTrigger>
                    <SelectContent>
                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Description / Agenda</Label>
            <Textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="all-day" checked={formData.all_day} onCheckedChange={(v) => handleChange('all_day', v)} />
            <Label htmlFor="all-day">All-day event</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Start</Label>
                <div className="flex gap-2">
                    <Input type="date" value={formData.start_date} onChange={(e) => handleChange('start_date', e.target.value)} />
                    {!formData.all_day && <Input type="time" value={formData.start_time_str} onChange={(e) => handleChange('start_time_str', e.target.value)} />}
                </div>
            </div>
             <div className="space-y-2">
                <Label>End</Label>
                 <div className="flex gap-2">
                    <Input type="date" value={formData.end_date} onChange={(e) => handleChange('end_date', e.target.value)} />
                    {!formData.all_day && <Input type="time" value={formData.end_time_str} onChange={(e) => handleChange('end_time_str', e.target.value)} />}
                </div>
            </div>
          </div>

          <AITimeSuggest
            currentData={formData}
            onSuggestion={(time) => {
              handleChange('start_time_str', time);
              // You might want to auto-update end time based on duration
            }}
          />

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}