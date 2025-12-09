import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TaskDependencyManager({ task, allTasks, onSave, onClose }) {
  const [dependencies, setDependencies] = useState(task.dependencies || []);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // Filter out current task and tasks that would create circular dependencies
  const getAvailableTasks = () => {
    const checkCircular = (taskId, visited = new Set()) => {
      if (visited.has(taskId)) return true;
      visited.add(taskId);
      
      const dependentTask = allTasks.find(t => t.id === taskId);
      if (!dependentTask?.dependencies) return false;
      
      for (const depId of dependentTask.dependencies) {
        if (depId === task.id || checkCircular(depId, new Set(visited))) {
          return true;
        }
      }
      return false;
    };

    return allTasks.filter(t => 
      t.id !== task.id && 
      !dependencies.includes(t.id) &&
      !checkCircular(t.id)
    );
  };

  const availableTasks = getAvailableTasks();

  const addDependency = () => {
    if (selectedTaskId && !dependencies.includes(selectedTaskId)) {
      setDependencies([...dependencies, selectedTaskId]);
      setSelectedTaskId("");
    }
  };

  const removeDependency = (taskId) => {
    setDependencies(dependencies.filter(id => id !== taskId));
  };

  const handleSave = () => {
    onSave(dependencies);
  };

  const getDependentTaskInfo = (taskId) => {
    return allTasks.find(t => t.id === taskId);
  };

  const getBlockedTasks = () => {
    return allTasks.filter(t => t.dependencies?.includes(task.id));
  };

  const blockedTasks = getBlockedTasks();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Manage Task Dependencies
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Current Task</h3>
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="font-medium text-slate-900">{task.title}</div>
              {task.description && (
                <div className="text-sm text-slate-600 mt-1">{task.description}</div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dependencies (Tasks that must be completed first)</Label>
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                This task cannot start until all its dependencies are completed.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a task to add as dependency" />
                </SelectTrigger>
                <SelectContent>
                  {availableTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                      {t.status === 'completed' && ' ✓'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addDependency}
                disabled={!selectedTaskId}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {dependencies.length > 0 ? (
              <div className="space-y-2">
                {dependencies.map((depId) => {
                  const depTask = getDependentTaskInfo(depId);
                  if (!depTask) return null;
                  
                  return (
                    <div key={depId} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{depTask.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={
                              depTask.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-800'
                                : depTask.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-800'
                            }
                          >
                            {depTask.status.replace('_', ' ')}
                          </Badge>
                          {depTask.due_date && (
                            <span className="text-xs text-slate-600">
                              Due: {new Date(depTask.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDependency(depId)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm">
                No dependencies added. This task can start immediately.
              </div>
            )}
          </div>

          {blockedTasks.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <Label>Tasks Blocked by This Task ({blockedTasks.length})</Label>
              <div className="space-y-2">
                {blockedTasks.map((blockedTask) => (
                  <div key={blockedTask.id} className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <div className="font-medium text-slate-900">{blockedTask.title}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      This task cannot start until "{task.title}" is completed
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Dependencies
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}