import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AISchedulingAssistant({ jobs, staff, locations, clients, onRefresh }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedule, setSchedule] = useState(null);
    const [conflicts, setConflicts] = useState([]);

    const generateSchedule = async () => {
        setIsGenerating(true);
        try {
            const unscheduledJobs = jobs.filter(j => j.status === 'draft' || !j.scheduled_start_at);
            const scheduledForDate = jobs.filter(j => {
                const jobDate = new Date(j.scheduled_start_at).toISOString().split('T')[0];
                return jobDate === selectedDate;
            });

            const staffAvailability = staff.map(s => ({
                email: s.email,
                name: s.full_name,
                role: s.staff_role,
                max_hours_per_day: s.max_hours_per_day || 8,
                available_days: s.available_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                is_active: s.is_active
            }));

            const jobsWithDetails = [...unscheduledJobs, ...scheduledForDate].map(job => {
                const location = locations.find(l => l.id === job.client_location_id);
                const client = clients.find(c => c.id === job.client_id);
                return {
                    job_id: job.id,
                    client_name: client?.name,
                    location: location ? `${location.address_line1}, ${location.city}` : 'Unknown',
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    priority: job.priority || 'medium',
                    estimated_duration: job.estimated_duration_minutes || 60,
                    preferred_time: job.preferred_time_slot,
                    recurring: job.recurring_schedule,
                    current_assignment: job.assigned_cleaners,
                    current_time: job.scheduled_start_at,
                    status: job.status
                };
            });

            const existingAssignments = scheduledForDate.map(j => ({
                staff_email: j.assigned_cleaners?.[0],
                start_time: j.scheduled_start_at,
                duration: j.estimated_duration_minutes || 60,
                job_id: j.id
            }));

            const prompt = `You are an intelligent scheduling assistant for a cleaning business. Create an optimal daily schedule for ${new Date(selectedDate).toLocaleDateString()}.

Available Staff:
${JSON.stringify(staffAvailability.filter(s => s.is_active), null, 2)}

Jobs to Schedule:
${JSON.stringify(jobsWithDetails, null, 2)}

Existing Assignments for this Date:
${JSON.stringify(existingAssignments, null, 2)}

Optimize the schedule considering:
1. Job Priority (high priority jobs should be scheduled first/at preferred times)
2. Client Preferences (time slots, recurring schedules)
3. Staff Availability and Max Hours
4. Geographic Proximity (minimize travel time between jobs)
5. Balanced Workload across staff
6. Realistic travel times between locations
7. Buffer time between jobs (15 minutes)

Detect and resolve conflicts:
- Double bookings
- Overlapping assignments
- Staff exceeding max hours
- Jobs at unrealistic times
- Insufficient travel time between jobs

Provide optimized assignments and conflict resolutions.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        optimized_assignments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    job_id: { type: "string" },
                                    assigned_to: { type: "string" },
                                    suggested_start_time: { type: "string" },
                                    suggested_end_time: { type: "string" },
                                    reasoning: { type: "string" },
                                    travel_time_from_previous: { type: "number" }
                                }
                            }
                        },
                        conflicts_detected: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    severity: { type: "string", enum: ["low", "medium", "high"] },
                                    description: { type: "string" },
                                    affected_jobs: { type: "array", items: { type: "string" } },
                                    affected_staff: { type: "array", items: { type: "string" } },
                                    suggested_resolution: { type: "string" }
                                }
                            }
                        },
                        staff_utilization: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    staff_email: { type: "string" },
                                    assigned_jobs: { type: "number" },
                                    total_hours: { type: "number" },
                                    utilization_percentage: { type: "number" }
                                }
                            }
                        },
                        unscheduled_jobs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    job_id: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        },
                        optimization_summary: { type: "string" },
                        total_travel_time_minutes: { type: "number" },
                        efficiency_score: { type: "number", minimum: 0, maximum: 100 }
                    }
                }
            });

            setSchedule(response);
            setConflicts(response.conflicts_detected || []);
        } catch (error) {
            console.error('Error generating schedule:', error);
        }
        setIsGenerating(false);
    };

    const applySchedule = async () => {
        if (!schedule?.optimized_assignments) return;

        try {
            for (const assignment of schedule.optimized_assignments) {
                const job = jobs.find(j => j.id === assignment.job_id);
                if (job) {
                    await base44.entities.CleaningJob.update(job.id, {
                        scheduled_start_at: assignment.suggested_start_time,
                        assigned_cleaners: [assignment.assigned_to],
                        status: 'scheduled'
                    });
                }
            }
            
            setSchedule(null);
            setConflicts([]);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error applying schedule:', error);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-yellow-100 text-yellow-800',
            medium: 'bg-orange-100 text-orange-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[severity] || 'bg-slate-100 text-slate-800';
    };

    const availableDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        availableDates.push(date.toISOString().split('T')[0]);
    }

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    AI Scheduling Assistant
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!schedule ? (
                    <div className="space-y-4">
                        <p className="text-slate-600">
                            Generate an optimized schedule that balances workload, minimizes travel time, and respects priorities
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Date</label>
                            <Select value={selectedDate} onValueChange={setSelectedDate}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDates.map(date => (
                                        <SelectItem key={date} value={date}>
                                            {new Date(date).toLocaleDateString(undefined, { 
                                                weekday: 'long', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="text-xs text-slate-600 mb-1">Available Staff</div>
                                <div className="text-xl font-bold text-blue-600">
                                    {staff.filter(s => s.is_active).length}
                                </div>
                            </div>
                            <div className="bg-amber-50 p-3 rounded">
                                <div className="text-xs text-slate-600 mb-1">Unscheduled Jobs</div>
                                <div className="text-xl font-bold text-amber-600">
                                    {jobs.filter(j => j.status === 'draft').length}
                                </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded">
                                <div className="text-xs text-slate-600 mb-1">Locations</div>
                                <div className="text-xl font-bold text-green-600">
                                    {locations.length}
                                </div>
                            </div>
                        </div>

                        <Button onClick={generateSchedule} disabled={isGenerating} className="w-full">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating Optimal Schedule...
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Generate Schedule
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-lg">
                                    {new Date(selectedDate).toLocaleDateString(undefined, { 
                                        weekday: 'long', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </div>
                                <div className="text-sm text-slate-600">Efficiency Score: {schedule.efficiency_score}/100</div>
                            </div>
                            <Button onClick={() => setSchedule(null)} variant="outline" size="sm">
                                Back
                            </Button>
                        </div>

                        {schedule.optimization_summary && (
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertDescription>{schedule.optimization_summary}</AlertDescription>
                            </Alert>
                        )}

                        {conflicts.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                                    <AlertCircle className="w-4 h-4" />
                                    Conflicts Detected ({conflicts.length})
                                </div>
                                {conflicts.map((conflict, idx) => (
                                    <Alert key={idx} className="bg-orange-50 border-orange-200">
                                        <AlertDescription>
                                            <div className="flex items-start gap-2">
                                                <Badge className={getSeverityColor(conflict.severity)}>
                                                    {conflict.severity}
                                                </Badge>
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm mb-1">{conflict.type}</div>
                                                    <div className="text-sm text-slate-700 mb-2">{conflict.description}</div>
                                                    <div className="text-sm text-green-700">
                                                        <strong>Resolution:</strong> {conflict.suggested_resolution}
                                                    </div>
                                                </div>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded border">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-slate-600">Scheduled Jobs</span>
                                </div>
                                <div className="text-lg font-bold">{schedule.optimized_assignments?.length || 0}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs text-slate-600">Total Travel</span>
                                </div>
                                <div className="text-lg font-bold">{schedule.total_travel_time_minutes} min</div>
                            </div>
                        </div>

                        {schedule.staff_utilization?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Staff Utilization</div>
                                {schedule.staff_utilization.map((util, idx) => {
                                    const staffMember = staff.find(s => s.email === util.staff_email);
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{staffMember?.full_name}</div>
                                                <div className="text-xs text-slate-600">
                                                    {util.assigned_jobs} jobs • {util.total_hours.toFixed(1)}h • {util.utilization_percentage}% utilized
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {schedule.optimized_assignments?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Scheduled Assignments</div>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {schedule.optimized_assignments.map((assignment, idx) => {
                                        const job = jobs.find(j => j.id === assignment.job_id);
                                        const staffMember = staff.find(s => s.email === assignment.assigned_to);
                                        return (
                                            <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="text-sm font-medium">Job #{idx + 1}</div>
                                                    <div className="text-xs text-slate-600">
                                                        {new Date(assignment.suggested_start_time).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-700 mb-1">
                                                    <strong>Staff:</strong> {staffMember?.full_name}
                                                </div>
                                                <div className="text-xs text-slate-600">{assignment.reasoning}</div>
                                                {assignment.travel_time_from_previous > 0 && (
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        Travel time: {assignment.travel_time_from_previous} min
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {schedule.unscheduled_jobs?.length > 0 && (
                            <Alert className="bg-amber-50 border-amber-200">
                                <AlertDescription>
                                    <div className="font-medium mb-2">Unscheduled Jobs ({schedule.unscheduled_jobs.length})</div>
                                    {schedule.unscheduled_jobs.map((unscheduled, idx) => (
                                        <div key={idx} className="text-sm text-amber-700 mb-1">
                                            • {unscheduled.reason}
                                        </div>
                                    ))}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={applySchedule} className="flex-1 bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Apply Schedule
                            </Button>
                            <Button onClick={generateSchedule} variant="outline" className="flex-1">
                                Regenerate
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}