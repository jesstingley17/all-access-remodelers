import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, Play, StopCircle, FolderOpen, CheckSquare } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

export default function LiveTimer({ projects, tasks, onTimerStop, isLoading }) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [description, setDescription] = useState("");
  const [isBillable, setIsBillable] = useState(true);

  const availableTasks = selectedProjectId 
    ? tasks.filter(task => task.project_id === selectedProjectId) 
    : [];

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = () => {
    if (!selectedProjectId || !selectedTaskId) {
      alert("Please select a project and a task.");
      return;
    }
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    const endTime = new Date();
    const entry = {
      project_id: selectedProjectId,
      task_id: selectedTaskId,
      description: description || tasks.find(t => t.id === selectedTaskId)?.title,
      start_time: new Date(startTime).toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: Math.round(elapsedTime / 60000),
      is_billable: isBillable,
    };
    onTimerStop(entry);
    
    // Reset form
    setElapsedTime(0);
    setDescription("");
    setSelectedTaskId("");
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Timer className="w-5 h-5" />
          Live Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Task</Label>
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId} disabled={isRunning || !selectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you working on?"
                disabled={isRunning}
              />
            </div>

            <div className="p-6 bg-slate-100 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-5xl font-mono font-bold text-slate-900 tracking-tighter">
                {formatTime(elapsedTime)}
              </div>
              
              {!isRunning ? (
                <Button 
                  size="lg" 
                  onClick={handleStart} 
                  disabled={!selectedProjectId || !selectedTaskId}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  onClick={handleStop}
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Stop Timer
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}