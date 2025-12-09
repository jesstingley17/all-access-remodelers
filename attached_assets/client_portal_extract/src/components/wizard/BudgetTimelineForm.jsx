import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Clock, ArrowRight, ArrowLeft, Calendar, AlertTriangle } from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low Priority", description: "Flexible timeline, standard delivery", color: "text-slate-600" },
  { value: "medium", label: "Medium Priority", description: "Balanced timeline and quality", color: "text-blue-600" },
  { value: "high", label: "High Priority", description: "Important project, faster delivery", color: "text-amber-600" },
  { value: "urgent", label: "Urgent Priority", description: "Critical timeline, immediate attention", color: "text-red-600" }
];

export default function BudgetTimelineForm({ data, onChange, onNext, onPrev }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  // Calculate suggested buffer time based on estimated hours
  const getSuggestedBuffer = () => {
    const hours = data.estimated_hours || 0;
    if (hours <= 20) return 0.2; // 20% buffer for small projects
    if (hours <= 50) return 0.25; // 25% buffer for medium projects
    if (hours <= 100) return 0.3; // 30% buffer for large projects
    return 0.35; // 35% buffer for very large projects
  };

  const suggestedBufferHours = Math.ceil((data.estimated_hours || 0) * getSuggestedBuffer());
  const totalWithBuffer = (data.estimated_hours || 0) + suggestedBufferHours;

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <DollarSign className="w-5 h-5" />
          Budget & Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Budget Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Project Budget</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-slate-700 font-medium">
                  Total Budget ($)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="100"
                  value={data.budget || ''}
                  onChange={(e) => onChange({ budget: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter project budget"
                  className="h-12 border-slate-200 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Hourly Rate Estimate</Label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {data.budget && data.estimated_hours ? (
                    <div className="text-lg font-semibold text-slate-900">
                      ${(data.budget / data.estimated_hours).toFixed(0)}/hour
                    </div>
                  ) : (
                    <div className="text-slate-500">Enter budget and hours to calculate</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Time Estimation Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Time Estimation</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="estimated_hours" className="text-slate-700 font-medium">
                  Estimated Hours
                </Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={data.estimated_hours || ''}
                  onChange={(e) => onChange({ estimated_hours: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter estimated hours"
                  className="h-12 border-slate-200 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Buffer Time Suggestion</Label>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Recommended Buffer</span>
                  </div>
                  <div className="text-sm text-amber-700">
                    Add {suggestedBufferHours}h ({(getSuggestedBuffer() * 100).toFixed(0)}% buffer)
                  </div>
                  <div className="text-sm text-amber-600 mt-1">
                    Total: {totalWithBuffer}h with buffer
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Project Timeline</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-slate-700 font-medium">
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={data.start_date}
                  onChange={(e) => onChange({ start_date: e.target.value })}
                  className="h-12 border-slate-200 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-slate-700 font-medium">
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={data.due_date}
                  onChange={(e) => onChange({ due_date: e.target.value })}
                  className="h-12 border-slate-200 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Priority Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Project Priority</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {PRIORITY_OPTIONS.map((priority) => (
                <div
                  key={priority.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    data.priority === priority.value
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onChange({ priority: priority.value })}
                >
                  <div className={`font-semibold ${priority.color}`}>{priority.label}</div>
                  <div className="text-sm text-slate-600 mt-1">{priority.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Access */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Client Access Settings</h3>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="client_access"
                checked={data.client_access_enabled}
                onCheckedChange={(checked) => onChange({ client_access_enabled: checked })}
              />
              <label htmlFor="client_access" className="text-sm text-slate-700 cursor-pointer">
                Allow client to view project progress and milestones
              </label>
            </div>
            <p className="text-xs text-slate-600">
              When enabled, clients can view project status, completed deliverables, and timeline progress through a dedicated client portal.
            </p>
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrev} size="lg" className="px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button 
              type="submit" 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
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