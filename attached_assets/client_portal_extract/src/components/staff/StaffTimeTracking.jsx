import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Play, Square } from 'lucide-react';

export default function StaffTimeTracking({ staff, jobs, timeEntries, onRefresh }) {
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentEntry, setCurrentEntry] = useState(null);

    const activeJobs = jobs.filter(j => j.status === 'scheduled' || j.status === 'in_progress');

    const checkClockInStatus = (staffEmail) => {
        const activeEntry = timeEntries.find(e => 
            e.staff_email === staffEmail && !e.clock_out
        );
        if (activeEntry) {
            setCurrentEntry(activeEntry);
            setIsClockedIn(true);
        }
    };

    const handleClockIn = async () => {
        if (!selectedStaff || !selectedJob) return;

        try {
            const entry = await base44.entities.StaffTimeEntry.create({
                job_id: selectedJob,
                staff_email: selectedStaff,
                clock_in: new Date().toISOString()
            });
            setCurrentEntry(entry);
            setIsClockedIn(true);
            onRefresh();
        } catch (error) {
            console.error('Error clocking in:', error);
        }
    };

    const handleClockOut = async () => {
        if (!currentEntry) return;

        try {
            const clockOutTime = new Date();
            const clockInTime = new Date(currentEntry.clock_in);
            const durationMinutes = Math.round((clockOutTime - clockInTime) / (1000 * 60));

            await base44.entities.StaffTimeEntry.update(currentEntry.id, {
                clock_out: clockOutTime.toISOString(),
                duration_minutes: durationMinutes
            });

            setIsClockedIn(false);
            setCurrentEntry(null);
            setSelectedJob('');
            onRefresh();
        } catch (error) {
            console.error('Error clocking out:', error);
        }
    };

    const getStaffHours = (staffEmail) => {
        const staffEntries = timeEntries.filter(e => e.staff_email === staffEmail);
        return (staffEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60).toFixed(1);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Clock In/Out</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isClockedIn ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Staff Member</label>
                                <Select value={selectedStaff} onValueChange={(value) => {
                                    setSelectedStaff(value);
                                    checkClockInStatus(value);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staff.filter(s => s.is_active).map(member => (
                                            <SelectItem key={member.email} value={member.email}>
                                                {member.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job</label>
                                <Select value={selectedJob} onValueChange={setSelectedJob}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeJobs.map(job => (
                                            <SelectItem key={job.id} value={job.id}>
                                                Job #{job.id.slice(0, 8)} - {new Date(job.scheduled_start_at).toLocaleDateString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button 
                                onClick={handleClockIn}
                                disabled={!selectedStaff || !selectedJob}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Clock In
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-800 mb-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">Currently Clocked In</span>
                                </div>
                                <div className="text-sm text-slate-600">
                                    Since: {new Date(currentEntry.clock_in).toLocaleString()}
                                </div>
                            </div>

                            <Button 
                                onClick={handleClockOut}
                                variant="destructive"
                                className="w-full"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                Clock Out
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Time Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {staff.map(member => (
                            <div key={member.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <div className="font-medium">{member.full_name}</div>
                                    <div className="text-sm text-slate-600">{member.staff_role}</div>
                                </div>
                                <Badge variant="outline">
                                    {getStaffHours(member.email)}h
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Time Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {timeEntries.slice(0, 10).map(entry => {
                            const staffMember = staff.find(s => s.email === entry.staff_email);
                            return (
                                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{staffMember?.full_name || entry.staff_email}</div>
                                        <div className="text-sm text-slate-600">
                                            {new Date(entry.clock_in).toLocaleString()}
                                            {entry.clock_out && ` - ${new Date(entry.clock_out).toLocaleString()}`}
                                        </div>
                                    </div>
                                    {entry.duration_minutes && (
                                        <Badge>{(entry.duration_minutes / 60).toFixed(1)}h</Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}