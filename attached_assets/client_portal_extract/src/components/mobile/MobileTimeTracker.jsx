import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, MapPin, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MobileTimeTracker({ currentUser, jobId }) {
    const [activeTimer, setActiveTimer] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        loadActiveTimer();
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        let interval;
        if (activeTimer) {
            interval = setInterval(() => {
                const start = new Date(activeTimer.clock_in);
                const now = new Date();
                setElapsedTime(Math.floor((now - start) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTimer]);

    const loadActiveTimer = () => {
        const stored = localStorage.getItem('active_timer');
        if (stored) {
            setActiveTimer(JSON.parse(stored));
        }
    };

    const captureLocation = () => {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const loc = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                        setLocation(loc);
                        resolve(loc);
                    },
                    () => resolve(null)
                );
            } else {
                resolve(null);
            }
        });
    };

    const clockIn = async () => {
        const loc = await captureLocation();
        const timer = {
            job_id: jobId,
            staff_email: currentUser.email,
            clock_in: new Date().toISOString(),
            location: loc,
            synced: false
        };

        setActiveTimer(timer);
        localStorage.setItem('active_timer', JSON.stringify(timer));

        if (isOnline) {
            try {
                const entry = await base44.entities.StaffTimeEntry.create({
                    job_id: jobId,
                    staff_email: currentUser.email,
                    clock_in: timer.clock_in,
                    location_verified: !!loc
                });
                timer.id = entry.id;
                timer.synced = true;
                localStorage.setItem('active_timer', JSON.stringify(timer));
            } catch (error) {
                console.error('Error clocking in:', error);
            }
        }
    };

    const clockOut = async () => {
        if (!activeTimer) return;

        const clockOutTime = new Date().toISOString();
        const duration = Math.floor((new Date(clockOutTime) - new Date(activeTimer.clock_in)) / 60000);
        const loc = await captureLocation();

        if (isOnline && activeTimer.id) {
            try {
                await base44.entities.StaffTimeEntry.update(activeTimer.id, {
                    clock_out: clockOutTime,
                    duration_minutes: duration
                });
            } catch (error) {
                console.error('Error clocking out:', error);
            }
        } else {
            const pending = JSON.parse(localStorage.getItem('pending_time_entries') || '[]');
            pending.push({
                ...activeTimer,
                clock_out: clockOutTime,
                duration_minutes: duration,
                location_out: loc
            });
            localStorage.setItem('pending_time_entries', JSON.stringify(pending));
        }

        setActiveTimer(null);
        setElapsedTime(0);
        localStorage.removeItem('active_timer');
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Tracker
                    {isOnline ? (
                        <Wifi className="w-4 h-4 text-green-600 ml-auto" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-amber-600 ml-auto" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isOnline && !activeTimer?.synced && (
                    <Alert className="bg-amber-50 border-amber-200">
                        <WifiOff className="w-4 h-4" />
                        <AlertDescription>
                            Offline - Time will be synced when back online
                        </AlertDescription>
                    </Alert>
                )}

                {activeTimer ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                            <div className="text-4xl font-bold text-green-700 mb-2">
                                {formatTime(elapsedTime)}
                            </div>
                            <Badge className="bg-green-600">
                                <Play className="w-3 h-3 mr-1" />
                                Active
                            </Badge>
                        </div>

                        <div className="text-sm text-slate-600">
                            <div>Started: {new Date(activeTimer.clock_in).toLocaleTimeString()}</div>
                            {activeTimer.location && (
                                <div className="flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    Location verified
                                </div>
                            )}
                        </div>

                        <Button 
                            onClick={clockOut} 
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            Clock Out
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-6 rounded-lg text-center">
                            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-600">Not clocked in</p>
                        </div>

                        <Button 
                            onClick={clockIn} 
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Clock In
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}