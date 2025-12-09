import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock } from 'lucide-react';

export default function StaffScheduler({ staff, jobs, onRefresh }) {
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    const unassignedJobs = jobs.filter(j => 
        (!j.assigned_cleaners || j.assigned_cleaners.length === 0) && 
        j.status !== 'completed' && 
        j.status !== 'cancelled'
    );

    const handleAssignStaff = async () => {
        if (!selectedJob || !selectedStaff) return;

        setIsAssigning(true);
        try {
            const currentAssigned = selectedJob.assigned_cleaners || [];
            await base44.entities.CleaningJob.update(selectedJob.id, {
                assigned_cleaners: [...currentAssigned, selectedStaff]
            });
            onRefresh();
            setSelectedJob(null);
            setSelectedStaff('');
        } catch (error) {
            console.error('Error assigning staff:', error);
        }
        setIsAssigning(false);
    };

    const getAvailableStaff = (job) => {
        if (!job) return staff;
        const jobDate = new Date(job.scheduled_start_at);
        const dayOfWeek = jobDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
        
        return staff.filter(s => {
            if (!s.is_active) return false;
            if (!s.availability_schedule?.[dayOfWeek]) return true;
            return s.availability_schedule[dayOfWeek].length > 0;
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Assign Staff to Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {unassignedJobs.length === 0 ? (
                        <p className="text-slate-600 text-center py-8">
                            All jobs have staff assigned
                        </p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Job</label>
                                <div className="grid gap-2">
                                    {unassignedJobs.map(job => (
                                        <div 
                                            key={job.id}
                                            onClick={() => setSelectedJob(job)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedJob?.id === job.id 
                                                    ? 'bg-blue-50 border-blue-300' 
                                                    : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">Job #{job.id.slice(0, 8)}</div>
                                                    <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(job.scheduled_start_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <Badge>{job.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedJob && (
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Assign Staff Member</label>
                                        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select staff member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableStaff(selectedJob).map(member => (
                                                    <SelectItem key={member.email} value={member.email}>
                                                        {member.full_name} ({member.staff_role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button 
                                        onClick={handleAssignStaff}
                                        disabled={!selectedStaff || isAssigning}
                                        className="w-full"
                                    >
                                        {isAssigning ? 'Assigning...' : 'Assign to Job'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {staff.map(member => {
                            const assignedJobs = jobs.filter(j => 
                                j.assigned_cleaners?.includes(member.email) &&
                                j.status !== 'completed' &&
                                j.status !== 'cancelled'
                            );
                            
                            return (
                                <div key={member.email} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-600" />
                                            <span className="font-medium">{member.full_name}</span>
                                        </div>
                                        <Badge variant="outline">{assignedJobs.length} jobs</Badge>
                                    </div>
                                    {assignedJobs.length > 0 && (
                                        <div className="text-sm text-slate-600 space-y-1 mt-2">
                                            {assignedJobs.map(job => (
                                                <div key={job.id} className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(job.scheduled_start_at).toLocaleDateString()} - {job.status}
                                                </div>
                                            ))}
                                        </div>
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