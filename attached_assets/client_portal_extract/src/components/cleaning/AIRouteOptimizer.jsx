import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Route, Loader2, MapPin, Clock, DollarSign, TrendingDown } from 'lucide-react';

export default function AIRouteOptimizer({ jobs, locations, staff }) {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [optimizedRoute, setOptimizedRoute] = useState(null);

    const optimizeRoute = async () => {
        if (!selectedStaff) return;

        setIsOptimizing(true);
        try {
            const staffMember = staff.find(s => s.email === selectedStaff);
            const dateJobs = jobs.filter(j => {
                const jobDate = new Date(j.scheduled_start_at).toISOString().split('T')[0];
                return jobDate === selectedDate && j.assigned_cleaners?.includes(selectedStaff);
            });

            if (dateJobs.length === 0) {
                setOptimizedRoute({ error: 'No jobs assigned for this date' });
                setIsOptimizing(false);
                return;
            }

            const jobsWithLocations = dateJobs.map(job => {
                const location = locations.find(l => l.id === job.client_location_id);
                return {
                    job_id: job.id,
                    scheduled_time: job.scheduled_start_at,
                    estimated_duration: job.estimated_duration_minutes || 60,
                    address: location ? `${location.address_line1}, ${location.city}, ${location.state} ${location.postal_code}` : 'Address not available',
                    location_name: location?.label || 'Unknown',
                    client_id: job.client_id
                };
            });

            const prompt = `You are a route optimization expert. Optimize the daily route for a cleaning service staff member to minimize travel time and costs.

Staff: ${staffMember?.full_name || selectedStaff}
Date: ${new Date(selectedDate).toLocaleDateString()}
Number of Jobs: ${jobsWithLocations.length}

Jobs:
${JSON.stringify(jobsWithLocations, null, 2)}

Analyze and optimize considering:
- Geographic proximity of locations
- Scheduled appointment times
- Estimated job durations
- Travel time between locations (use real-world estimates)
- Traffic patterns for this date/time
- Start from first job and end at last job

Provide an optimized sequence that:
- Minimizes total travel time
- Respects scheduled time windows
- Groups nearby locations together
- Suggests best time to travel between locations
- Calculates fuel cost savings vs. unoptimized route (assume $3.50/gallon, 25 MPG)`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        optimized_sequence: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    job_id: { type: "string" },
                                    order: { type: "number" },
                                    suggested_arrival_time: { type: "string" },
                                    travel_time_from_previous: { type: "number" },
                                    distance_miles: { type: "number" }
                                }
                            }
                        },
                        total_distance_miles: { type: "number" },
                        total_travel_time_minutes: { type: "number" },
                        estimated_fuel_cost: { type: "number" },
                        unoptimized_distance_miles: { type: "number" },
                        unoptimized_travel_time_minutes: { type: "number" },
                        time_saved_minutes: { type: "number" },
                        cost_saved_dollars: { type: "number" },
                        route_notes: { type: "array", items: { type: "string" } },
                        optimization_summary: { type: "string" }
                    }
                }
            });

            setOptimizedRoute({
                ...response,
                jobs: jobsWithLocations,
                staff: staffMember,
                date: selectedDate
            });
        } catch (error) {
            console.error('Error optimizing route:', error);
        }
        setIsOptimizing(false);
    };

    const getJobDetails = (jobId) => {
        return optimizedRoute?.jobs?.find(j => j.job_id === jobId);
    };

    const availableDates = [...new Set(jobs.map(j => 
        new Date(j.scheduled_start_at).toISOString().split('T')[0]
    ))].sort();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5 text-green-600" />
                    AI Route Optimizer
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!optimizedRoute ? (
                    <div className="space-y-4">
                        <p className="text-slate-600 mb-4">
                            Optimize daily routes to minimize travel time and fuel costs
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
                                            {new Date(date).toLocaleDateString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Staff Member</label>
                            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose staff" />
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

                        <Button 
                            onClick={optimizeRoute} 
                            disabled={!selectedStaff || isOptimizing}
                            className="w-full"
                        >
                            {isOptimizing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Optimizing Route...
                                </>
                            ) : (
                                <>
                                    <Route className="w-4 h-4 mr-2" />
                                    Optimize Route
                                </>
                            )}
                        </Button>
                    </div>
                ) : optimizedRoute.error ? (
                    <div className="text-center py-6">
                        <p className="text-slate-600 mb-4">{optimizedRoute.error}</p>
                        <Button onClick={() => setOptimizedRoute(null)} variant="outline">
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{optimizedRoute.staff?.full_name}</div>
                                <div className="text-sm text-slate-600">
                                    {new Date(optimizedRoute.date).toLocaleDateString()}
                                </div>
                            </div>
                            <Button onClick={() => setOptimizedRoute(null)} variant="outline" size="sm">
                                Back
                            </Button>
                        </div>

                        {optimizedRoute.optimization_summary && (
                            <div className="bg-green-50 p-3 rounded border border-green-200 text-sm">
                                {optimizedRoute.optimization_summary}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Route className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs text-slate-600">Distance</span>
                                </div>
                                <div className="text-lg font-bold text-blue-600">
                                    {optimizedRoute.total_distance_miles?.toFixed(1)} mi
                                </div>
                            </div>

                            <div className="bg-amber-50 p-3 rounded border border-amber-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs text-slate-600">Travel Time</span>
                                </div>
                                <div className="text-lg font-bold text-amber-600">
                                    {optimizedRoute.total_travel_time_minutes} min
                                </div>
                            </div>

                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs text-slate-600">Fuel Cost</span>
                                </div>
                                <div className="text-lg font-bold text-purple-600">
                                    ${optimizedRoute.estimated_fuel_cost?.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-100 p-3 rounded border border-green-300">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-5 h-5 text-green-700" />
                                <span className="font-medium text-green-900">Savings vs. Unoptimized</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-green-700">Time saved:</span>
                                    <span className="font-bold ml-1">{optimizedRoute.time_saved_minutes} min</span>
                                </div>
                                <div>
                                    <span className="text-green-700">Cost saved:</span>
                                    <span className="font-bold ml-1">${optimizedRoute.cost_saved_dollars?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-700">Optimized Route:</div>
                            {optimizedRoute.optimized_sequence?.map((stop, idx) => {
                                const jobDetails = getJobDetails(stop.job_id);
                                return (
                                    <div key={stop.job_id} className="flex gap-3 p-3 bg-slate-50 rounded border">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
                                            {stop.order}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{jobDetails?.location_name}</div>
                                            <div className="text-xs text-slate-600 mt-1">
                                                <MapPin className="w-3 h-3 inline mr-1" />
                                                {jobDetails?.address}
                                            </div>
                                            <div className="flex gap-3 mt-2 text-xs">
                                                <Badge variant="outline">
                                                    Arrive: {new Date(stop.suggested_arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Badge>
                                                {stop.travel_time_from_previous > 0 && (
                                                    <>
                                                        <span className="text-slate-600">
                                                            {stop.travel_time_from_previous} min from previous
                                                        </span>
                                                        <span className="text-slate-600">
                                                            {stop.distance_miles?.toFixed(1)} mi
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {optimizedRoute.route_notes?.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700">Route Notes:</div>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    {optimizedRoute.route_notes.map((note, idx) => (
                                        <li key={idx}>{note}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}