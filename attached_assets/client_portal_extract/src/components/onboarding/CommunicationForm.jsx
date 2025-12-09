import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MessageSquare, ArrowRight, ArrowLeft, Clock, Calendar, Zap } from "lucide-react";

const COMMUNICATION_METHODS = [
  { id: "email", label: "Email", icon: "📧" },
  { id: "phone", label: "Phone Calls", icon: "📞" },
  { id: "slack", label: "Slack", icon: "💬" },
  { id: "teams", label: "Microsoft Teams", icon: "👥" },
  { id: "zoom", label: "Zoom/Video Calls", icon: "📹" },
  { id: "in_person", label: "In-Person Meetings", icon: "🤝" }
];

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily", description: "Multiple check-ins per day" },
  { value: "weekly", label: "Weekly", description: "Regular weekly updates" },
  { value: "bi_weekly", label: "Bi-weekly", description: "Every two weeks" },
  { value: "monthly", label: "Monthly", description: "Monthly status updates" },
  { value: "as_needed", label: "As Needed", description: "Only when necessary" }
];

const STYLE_OPTIONS = [
  { value: "formal", label: "Formal", description: "Professional tone and structure" },
  { value: "casual", label: "Casual", description: "Relaxed and friendly approach" },
  { value: "detailed", label: "Detailed", description: "Comprehensive information sharing" },
  { value: "brief", label: "Brief", description: "Concise and to-the-point" }
];

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function CommunicationForm({ data, onChange, onNext, onPrev }) {
  const [selectedMethods, setSelectedMethods] = useState(data.communication_methods || []);
  const [availableDays, setAvailableDays] = useState(data.meeting_availability || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange({ 
      communication_methods: selectedMethods,
      meeting_availability: availableDays
    });
    onNext();
  };

  const toggleCommunicationMethod = (methodId) => {
    const updated = selectedMethods.includes(methodId)
      ? selectedMethods.filter(id => id !== methodId)
      : [...selectedMethods, methodId];
    setSelectedMethods(updated);
  };

  const toggleAvailableDay = (day) => {
    const updated = availableDays.includes(day)
      ? availableDays.filter(d => d !== day)
      : [...availableDays, day];
    setAvailableDays(updated);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <MessageSquare className="w-5 h-5" />
          Communication Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Communication Methods */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Preferred Communication Methods</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {COMMUNICATION_METHODS.map((method) => (
                <div key={method.id} className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Checkbox
                    id={method.id}
                    checked={selectedMethods.includes(method.id)}
                    onCheckedChange={() => toggleCommunicationMethod(method.id)}
                  />
                  <label htmlFor={method.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium text-slate-700">{method.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Communication Frequency */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Communication Frequency</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {FREQUENCY_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    data.communication_frequency === option.value
                      ? 'border-slate-400 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onChange({ communication_frequency: option.value })}
                >
                  <div className="font-medium text-slate-900">{option.label}</div>
                  <div className="text-sm text-slate-600">{option.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Communication Style */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Communication Style</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {STYLE_OPTIONS.map((style) => (
                <div
                  key={style.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    data.communication_style === style.value
                      ? 'border-slate-400 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onChange({ communication_style: style.value })}
                >
                  <div className="font-medium text-slate-900">{style.label}</div>
                  <div className="text-sm text-slate-600">{style.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Business Hours</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="business_hours_start" className="text-slate-700 font-medium">
                  Start Time
                </Label>
                <Input
                  id="business_hours_start"
                  type="time"
                  value={data.business_hours_start}
                  onChange={(e) => onChange({ business_hours_start: e.target.value })}
                  className="h-12 border-slate-200 focus:border-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_hours_end" className="text-slate-700 font-medium">
                  End Time
                </Label>
                <Input
                  id="business_hours_end"
                  type="time"
                  value={data.business_hours_end}
                  onChange={(e) => onChange({ business_hours_end: e.target.value })}
                  className="h-12 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Meeting Availability */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Meeting Availability</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Checkbox
                    id={day}
                    checked={availableDays.includes(day)}
                    onCheckedChange={() => toggleAvailableDay(day)}
                  />
                  <label htmlFor={day} className="font-medium text-slate-700 cursor-pointer text-sm">
                    {day}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrev} size="lg" className="px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button 
              type="submit" 
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}