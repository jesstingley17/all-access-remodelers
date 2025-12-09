import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  X,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Award,
  CheckCircle
} from "lucide-react";
import { BusinessGoal } from "@/api/entities";

const GOAL_TYPES = [
  { id: 'revenue', name: 'Revenue', icon: DollarSign, unit: 'currency', description: 'Track income and sales' },
  { id: 'profit', name: 'Profit', icon: TrendingUp, unit: 'currency', description: 'Monitor profitability' },
  { id: 'billable_hours', name: 'Billable Hours', icon: Clock, unit: 'hours', description: 'Track productive time' },
  { id: 'new_clients', name: 'New Clients', icon: Users, unit: 'count', description: 'Client acquisition' },
  { id: 'project_count', name: 'Projects Completed', icon: Target, unit: 'count', description: 'Project delivery' },
  { id: 'efficiency', name: 'Efficiency', icon: Award, unit: 'percentage', description: 'Performance metrics' },
  { id: 'client_satisfaction', name: 'Client Satisfaction', icon: CheckCircle, unit: 'percentage', description: 'Customer happiness' }
];

const PERIODS = [
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'yearly', name: 'Yearly' }
];

const PRIORITIES = [
  { id: 'low', name: 'Low', color: 'text-blue-600' },
  { id: 'medium', name: 'Medium', color: 'text-yellow-600' },
  { id: 'high', name: 'High', color: 'text-orange-600' },
  { id: 'critical', name: 'Critical', color: 'text-red-600' }
];

export default function GoalCreationModal({ onClose, onSave }) {
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    goal_type: '',
    target_value: '',
    unit: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    priority: 'medium',
    category: 'financial'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleGoalTypeChange = (goalType) => {
    const selectedType = GOAL_TYPES.find(type => type.id === goalType);
    setGoalData(prev => ({
      ...prev,
      goal_type: goalType,
      unit: selectedType?.unit || '',
      category: goalType === 'revenue' || goalType === 'profit' ? 'financial' :
                goalType === 'billable_hours' || goalType === 'efficiency' ? 'productivity' :
                goalType === 'new_clients' || goalType === 'client_satisfaction' ? 'client_relations' : 'growth'
    }));
  };

  const calculateEndDate = (startDate, period) => {
    const start = new Date(startDate);
    let end = new Date(start);
    
    switch (period) {
      case 'weekly':
        end.setDate(start.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(start.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1);
        break;
    }
    
    return end.toISOString().split('T')[0];
  };

  const handlePeriodChange = (period) => {
    const endDate = calculateEndDate(goalData.start_date, period);
    setGoalData(prev => ({
      ...prev,
      period,
      end_date: endDate
    }));
  };

  const handleStartDateChange = (startDate) => {
    const endDate = calculateEndDate(startDate, goalData.period);
    setGoalData(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));
  };

  const handleSave = async () => {
    if (!goalData.title || !goalData.goal_type || !goalData.target_value) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await BusinessGoal.create({
        ...goalData,
        target_value: parseFloat(goalData.target_value),
        current_value: 0,
        is_active: true,
        achieved: false
      });
      onSave(goalData);
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Failed to create goal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create New Business Goal
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-title">Goal Title *</Label>
              <Input
                id="goal-title"
                value={goalData.title}
                onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Reach $10K Monthly Revenue"
              />
            </div>
            
            <div>
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={goalData.description}
                onChange={(e) => setGoalData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you want to achieve and why it matters"
                rows={3}
              />
            </div>
          </div>

          {/* Goal Type */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Goal Type *</Label>
            <div className="grid grid-cols-2 gap-3">
              {GOAL_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = goalData.goal_type === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => handleGoalTypeChange(type.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <p className="text-sm text-slate-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target & Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target-value">Target Value *</Label>
              <Input
                id="target-value"
                type="number"
                value={goalData.target_value}
                onChange={(e) => setGoalData(prev => ({ ...prev, target_value: e.target.value }))}
                placeholder="Enter target number"
              />
            </div>
            
            <div>
              <Label htmlFor="goal-period">Time Period *</Label>
              <Select value={goalData.period} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={goalData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={goalData.end_date}
                onChange={(e) => setGoalData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="goal-priority">Priority Level</Label>
            <Select value={goalData.priority} onValueChange={(value) => setGoalData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority.id} value={priority.id}>
                    <span className={priority.color}>{priority.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal Preview */}
          {goalData.title && goalData.goal_type && goalData.target_value && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Goal Preview</h4>
              <p className="text-blue-700 text-sm">
                <strong>{goalData.title}</strong> - Achieve{' '}
                {goalData.unit === 'currency' && '$'}
                {goalData.target_value}
                {goalData.unit === 'percentage' && '%'}
                {goalData.unit === 'hours' && ' hours'}
                {goalData.unit === 'count' && ` ${goalData.goal_type.replace('_', ' ')}`}
                {' '}by {new Date(goalData.end_date).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!goalData.title || !goalData.goal_type || !goalData.target_value || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}