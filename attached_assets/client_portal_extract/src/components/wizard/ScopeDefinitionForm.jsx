import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Plus, Trash2, ArrowRight, ArrowLeft, Calendar, CheckSquare } from "lucide-react";

export default function ScopeDefinitionForm({ data, onChange, onNext, onPrev }) {
  const [deliverables, setDeliverables] = useState(data.deliverables || []);
  const [milestones, setMilestones] = useState(data.milestones || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange({ 
      deliverables: deliverables.filter(d => d.title.trim()),
      milestones: milestones.filter(m => m.title.trim())
    });
    onNext();
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, { title: "", description: "", completed: false, due_date: "" }]);
  };

  const updateDeliverable = (index, field, value) => {
    const updated = deliverables.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setDeliverables(updated);
  };

  const removeDeliverable = (index) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", due_date: "", completed: false }]);
  };

  const updateMilestone = (index, field, value) => {
    const updated = milestones.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setMilestones(updated);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Target className="w-5 h-5" />
          Scope & Deliverables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Deliverables Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-800">Project Deliverables</h3>
              </div>
              <Button type="button" variant="outline" onClick={addDeliverable}>
                <Plus className="w-4 h-4 mr-2" />
                Add Deliverable
              </Button>
            </div>

            {deliverables.length > 0 ? (
              <div className="space-y-4">
                {deliverables.map((deliverable, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-700">Deliverable {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Deliverable title"
                          value={deliverable.title}
                          onChange={(e) => updateDeliverable(index, 'title', e.target.value)}
                          className="border-slate-200"
                        />
                        <Input
                          type="date"
                          value={deliverable.due_date}
                          onChange={(e) => updateDeliverable(index, 'due_date', e.target.value)}
                          className="border-slate-200"
                        />
                      </div>
                      <Textarea
                        placeholder="Describe what will be delivered..."
                        value={deliverable.description}
                        onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                        className="h-20 border-slate-200 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No deliverables added yet. Click "Add Deliverable" to define what you'll deliver.</p>
              </div>
            )}
          </div>

          {/* Milestones Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-800">Project Milestones</h3>
              </div>
              <Button type="button" variant="outline" onClick={addMilestone}>
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            {milestones.length > 0 ? (
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-700">Milestone {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Milestone title"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          className="border-slate-200"
                        />
                        <Input
                          type="date"
                          value={milestone.due_date}
                          onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                          className="border-slate-200"
                        />
                      </div>
                      <Textarea
                        placeholder="Describe this milestone..."
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        className="h-20 border-slate-200 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No milestones added yet. Click "Add Milestone" to define key project checkpoints.</p>
              </div>
            )}
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