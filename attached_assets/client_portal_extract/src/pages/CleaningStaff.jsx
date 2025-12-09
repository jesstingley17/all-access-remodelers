import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Clock, Plus } from "lucide-react";
import StaffProfileCard from "../components/staff/StaffProfileCard";
import StaffScheduler from "../components/staff/StaffScheduler";
import StaffTimeTracking from "../components/staff/StaffTimeTracking";
import StaffCreateModal from "../components/staff/StaffCreateModal";

export default function CleaningStaff() {
  const [currentUser, setCurrentUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [staffData, jobsData, timeData] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.CleaningJob.filter(userFilter),
        base44.entities.StaffTimeEntry.filter(userFilter)
      ]);

      const cleaningStaff = staffData.filter(s => s.staff_role);
      setStaff(cleaningStaff || []);
      setJobs(jobsData || []);
      setTimeEntries(timeData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
            <p className="text-slate-600 mt-1">Manage team, schedules, and time tracking</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600">Total Staff</div>
              <div className="text-3xl font-bold text-blue-600">{staff.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600">Active Today</div>
              <div className="text-3xl font-bold text-green-600">
                {staff.filter(s => s.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600">Hours This Week</div>
              <div className="text-3xl font-bold text-purple-600">
                {(timeEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60).toFixed(1)}h
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="team" className="space-y-6">
          <TabsList>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="timetracking" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map(member => (
                <StaffProfileCard 
                  key={member.email} 
                  staff={member}
                  onRefresh={loadData}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <StaffScheduler 
              staff={staff}
              jobs={jobs}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="timetracking">
            <StaffTimeTracking 
              staff={staff}
              jobs={jobs}
              timeEntries={timeEntries}
              onRefresh={loadData}
            />
          </TabsContent>
        </Tabs>

        {showCreateModal && (
          <StaffCreateModal
            onClose={() => setShowCreateModal(false)}
            onRefresh={loadData}
          />
        )}
      </div>
    </div>
  );
}