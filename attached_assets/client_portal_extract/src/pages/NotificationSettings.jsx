import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Bell } from "lucide-react";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        loadPreferences(user);
      } catch (e) {
        setCurrentUser(null);
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const loadPreferences = async (user) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const prefs = await base44.entities.NotificationPreference.filter({
        user_email: user.email
      });
      
      if (prefs.length > 0) {
        setPreferences(prefs[0]);
      } else {
        // Create default preferences
        const defaultPrefs = {
          user_email: user.email,
          job_reminders: true,
          job_reminder_hours: 24,
          task_deadlines: true,
          task_deadline_hours: 24,
          project_updates: true,
          invoice_reminders: true,
          invoice_reminder_days: 3,
          new_messages: true,
          client_feedback: true,
          email_notifications: true,
          in_app_notifications: true
        };
        const created = await base44.entities.NotificationPreference.create(defaultPrefs);
        setPreferences(created);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
    setIsLoading(false);
  };

  const updatePreference = (field, value) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      await base44.entities.NotificationPreference.update(preferences.id, preferences);
      toast.success("Notification preferences saved");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Notification Settings
          </h1>
          <p className="text-slate-600 mt-1">Customize when and how you receive notifications</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="in_app">In-App Notifications</Label>
                <p className="text-sm text-slate-600">Show notifications in the app</p>
              </div>
              <Switch
                id="in_app"
                checked={preferences?.in_app_notifications}
                onCheckedChange={(checked) => updatePreference("in_app_notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email">Email Notifications</Label>
                <p className="text-sm text-slate-600">Send notifications to your email</p>
              </div>
              <Switch
                id="email"
                checked={preferences?.email_notifications}
                onCheckedChange={(checked) => updatePreference("email_notifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="job_reminders">Enable Job Reminders</Label>
                <p className="text-sm text-slate-600">Get notified about upcoming jobs</p>
              </div>
              <Switch
                id="job_reminders"
                checked={preferences?.job_reminders}
                onCheckedChange={(checked) => updatePreference("job_reminders", checked)}
              />
            </div>
            {preferences?.job_reminders && (
              <div>
                <Label htmlFor="job_hours">Hours Before Job</Label>
                <Input
                  id="job_hours"
                  type="number"
                  value={preferences?.job_reminder_hours}
                  onChange={(e) => updatePreference("job_reminder_hours", parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="task_deadlines">Enable Task Deadline Reminders</Label>
                <p className="text-sm text-slate-600">Get notified about upcoming task deadlines</p>
              </div>
              <Switch
                id="task_deadlines"
                checked={preferences?.task_deadlines}
                onCheckedChange={(checked) => updatePreference("task_deadlines", checked)}
              />
            </div>
            {preferences?.task_deadlines && (
              <div>
                <Label htmlFor="task_hours">Hours Before Deadline</Label>
                <Input
                  id="task_hours"
                  type="number"
                  value={preferences?.task_deadline_hours}
                  onChange={(e) => updatePreference("task_deadline_hours", parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="project_updates">Enable Project Update Notifications</Label>
                <p className="text-sm text-slate-600">Get notified when project status changes</p>
              </div>
              <Switch
                id="project_updates"
                checked={preferences?.project_updates}
                onCheckedChange={(checked) => updatePreference("project_updates", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="invoice_reminders">Enable Invoice Reminders</Label>
                <p className="text-sm text-slate-600">Get notified about invoice due dates</p>
              </div>
              <Switch
                id="invoice_reminders"
                checked={preferences?.invoice_reminders}
                onCheckedChange={(checked) => updatePreference("invoice_reminders", checked)}
              />
            </div>
            {preferences?.invoice_reminders && (
              <div>
                <Label htmlFor="invoice_days">Days Before Due Date</Label>
                <Input
                  id="invoice_days"
                  type="number"
                  value={preferences?.invoice_reminder_days}
                  onChange={(e) => updatePreference("invoice_reminder_days", parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new_messages">New Client Messages</Label>
                <p className="text-sm text-slate-600">Get notified about new messages</p>
              </div>
              <Switch
                id="new_messages"
                checked={preferences?.new_messages}
                onCheckedChange={(checked) => updatePreference("new_messages", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="client_feedback">Client Feedback</Label>
                <p className="text-sm text-slate-600">Get notified when clients leave feedback</p>
              </div>
              <Switch
                id="client_feedback"
                checked={preferences?.client_feedback}
                onCheckedChange={(checked) => updatePreference("client_feedback", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={savePreferences}
          disabled={isSaving}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}