import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Mail,
  Clock,
  Users,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { Report } from "@/api/entities";

const FREQUENCIES = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' }
];

export default function ScheduleModal({ report, onClose, onSave }) {
  const [scheduleData, setScheduleData] = useState({
    enabled: report.schedule?.enabled || false,
    frequency: report.schedule?.frequency || 'monthly',
    recipients: report.schedule?.recipients || [''],
    next_send: report.schedule?.next_send || '',
    time: '09:00',
    day_of_week: 1, // Monday
    day_of_month: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleRecipientChange = (index, value) => {
    const newRecipients = [...scheduleData.recipients];
    newRecipients[index] = value;
    setScheduleData(prev => ({ ...prev, recipients: newRecipients }));
  };

  const addRecipient = () => {
    setScheduleData(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const removeRecipient = (index) => {
    setScheduleData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const calculateNextSend = () => {
    const now = new Date();
    let nextSend = new Date();
    
    switch (scheduleData.frequency) {
      case 'daily':
        nextSend.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        const daysUntilTarget = (scheduleData.day_of_week - now.getDay() + 7) % 7;
        nextSend.setDate(now.getDate() + (daysUntilTarget || 7));
        break;
      case 'monthly':
        nextSend.setMonth(now.getMonth() + 1);
        nextSend.setDate(scheduleData.day_of_month);
        break;
      case 'quarterly':
        nextSend.setMonth(now.getMonth() + 3);
        nextSend.setDate(scheduleData.day_of_month);
        break;
    }
    
    const [hours, minutes] = scheduleData.time.split(':');
    nextSend.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return nextSend.toISOString();
  };

  const handleSave = async () => {
    const validRecipients = scheduleData.recipients.filter(email => email.trim() !== '');
    
    if (scheduleData.enabled && validRecipients.length === 0) {
      alert('Please add at least one email recipient');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        schedule: {
          enabled: scheduleData.enabled,
          frequency: scheduleData.frequency,
          recipients: validRecipients,
          next_send: scheduleData.enabled ? calculateNextSend() : null
        }
      };

      await Report.update(report.id, updateData);
      onSave(updateData.schedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Report: {report.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Enable/Disable Scheduling */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-scheduling"
              checked={scheduleData.enabled}
              onCheckedChange={(checked) => setScheduleData(prev => ({ ...prev, enabled: checked }))}
            />
            <label htmlFor="enable-scheduling" className="text-base font-semibold cursor-pointer">
              Enable Automated Report Delivery
            </label>
          </div>

          {scheduleData.enabled && (
            <>
              {/* Frequency */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Delivery Frequency</Label>
                <Select 
                  value={scheduleData.frequency} 
                  onValueChange={(value) => setScheduleData(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.id} value={freq.id}>
                        {freq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timing Details */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Delivery Time</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delivery-time" className="text-sm">Time of Day</Label>
                    <Input
                      id="delivery-time"
                      type="time"
                      value={scheduleData.time}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  
                  {scheduleData.frequency === 'weekly' && (
                    <div>
                      <Label htmlFor="day-of-week" className="text-sm">Day of Week</Label>
                      <Select 
                        value={scheduleData.day_of_week.toString()} 
                        onValueChange={(value) => setScheduleData(prev => ({ ...prev, day_of_week: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {(scheduleData.frequency === 'monthly' || scheduleData.frequency === 'quarterly') && (
                    <div>
                      <Label htmlFor="day-of-month" className="text-sm">Day of Month</Label>
                      <Input
                        id="day-of-month"
                        type="number"
                        min="1"
                        max="28"
                        value={scheduleData.day_of_month}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, day_of_month: parseInt(e.target.value) }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Email Recipients */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Email Recipients</Label>
                <div className="space-y-3">
                  {scheduleData.recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={recipient}
                          onChange={(e) => handleRecipientChange(index, e.target.value)}
                        />
                      </div>
                      {scheduleData.recipients.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeRecipient(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addRecipient}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Recipient
                  </Button>
                </div>
              </div>

              {/* Next Send Preview */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">Next Scheduled Delivery</span>
                </div>
                <p className="text-blue-600 text-sm">
                  {new Date(calculateNextSend()).toLocaleString()}
                </p>
              </div>

              {/* Email Preview */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Email Preview</Label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-sm space-y-2">
                    <div><strong>Subject:</strong> Scheduled Report: {report.name}</div>
                    <div><strong>Frequency:</strong> {FREQUENCIES.find(f => f.id === scheduleData.frequency)?.name}</div>
                    <div><strong>Recipients:</strong> {scheduleData.recipients.filter(email => email.trim()).length} recipient(s)</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Save Schedule
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}