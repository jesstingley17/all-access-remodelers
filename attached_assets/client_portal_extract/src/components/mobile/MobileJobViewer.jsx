import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle, Navigation, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MobileJobViewer({ currentUser }) {
    const [jobs, setJobs] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        loadJobs();
    }, [currentUser, isOnline]);

    const loadJobs = async () => {
        try {
            if (isOnline) {
                const today = new Date().toISOString().split('T')[0];
                const jobsData = await base44.entities.CleaningJob.filter({
                    assigned_cleaners: { $in: [currentUser?.email] }
                });
                
                const todayJobs = jobsData.filter(j => {
                    const jobDate = new Date(j.scheduled_start_at).toISOString().split('T')[0];
                    return jobDate === today;
                }).sort((a, b) => new Date(a.scheduled_start_at) - new Date(b.scheduled_start_at));
                
                setJobs(todayJobs);
                localStorage.setItem('offline_jobs', JSON.stringify(todayJobs));
            } else {
                const offlineData = localStorage.getItem('offline_jobs');
                if (offlineData) {
                    setJobs(JSON.parse(offlineData));
                }
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            const offlineData = localStorage.getItem('offline_jobs');
            if (offlineData) {
                setJobs(JSON.parse(offlineData));
            }
        }
    };

    const captureLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    };
                    setCurrentLocation(location);
                    localStorage.setItem('last_location', JSON.stringify(location));
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setIsLoadingLocation(false);
                }
            );
        }
    };

    const updateJobStatus = async (jobId, newStatus) => {
        const updatedJobs = jobs.map(j => 
            j.id === jobId ? { ...j, status: newStatus } : j
        );
        setJobs(updatedJobs);
        localStorage.setItem('offline_jobs', JSON.stringify(updatedJobs));

        if (isOnline) {
            try {
                await base44.entities.CleaningJob.update(jobId, { status: newStatus });
            } catch (error) {
                console.error('Error updating job:', error);
            }
        } else {
            const pending = JSON.parse(localStorage.getItem('pending_updates') || '[]');
            pending.push({ jobId, status: newStatus, timestamp: new Date().toISOString() });
            localStorage.setItem('pending_updates', JSON.stringify(pending));
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-amber-100 text-amber-800',
            completed: 'bg-emerald-100 text-emerald-800'
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Today's Jobs</h2>
                <div className="flex items-center gap-2">
                    {isOnline ? (
                        <Wifi className="w-5 h-5 text-green-600" />
                    ) : (
                        <WifiOff className="w-5 h-5 text-amber-600" />
                    )}
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={captureLocation}
                        disabled={isLoadingLocation}
                    >
                        <Navigation className="w-4 h-4 mr-1" />
                        {currentLocation ? 'Update' : 'Get'} Location
                    </Button>
                </div>
            </div>

            {!isOnline && (
                <Alert className="bg-amber-50 border-amber-200">
                    <WifiOff className="w-4 h-4" />
                    <AlertDescription>
                        Offline mode - Changes will sync when back online
                    </AlertDescription>
                </Alert>
            )}

            {currentLocation && (
                <Alert className="bg-blue-50 border-blue-200">
                    <MapPin className="w-4 h-4" />
                    <AlertDescription>
                        Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    </AlertDescription>
                </Alert>
            )}

            {jobs.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">No jobs scheduled for today</p>
                    </CardContent>
                </Card>
            ) : (
                jobs.map(job => (
                    <Card key={job.id} className="shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className={getStatusColor(job.status)}>
                                            {job.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base">
                                        Location ID: {job.client_location_id}
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="w-4 h-4" />
                                {new Date(job.scheduled_start_at).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                                {job.estimated_duration_minutes && (
                                    <span className="ml-2">({job.estimated_duration_minutes} min)</span>
                                )}
                            </div>

                            {job.notes_for_team && (
                                <div className="bg-slate-50 p-2 rounded text-sm text-slate-700">
                                    {job.notes_for_team}
                                </div>
                            )}

                            <div className="flex gap-2">
                                {job.status === 'scheduled' && (
                                    <Button 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => updateJobStatus(job.id, 'in_progress')}
                                    >
                                        Start Job
                                    </Button>
                                )}
                                {job.status === 'in_progress' && (
                                    <Button 
                                        size="sm" 
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => updateJobStatus(job.id, 'completed')}
                                    >
                                        Complete
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}