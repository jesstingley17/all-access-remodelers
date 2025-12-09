import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Sparkles, Loader2, Clock, Target, Zap, Link as LinkIcon } from "lucide-react";
import { generateSubtasks, predictCompletionTime, analyzeTaskComplexity } from './AITaskAssistant';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function TaskCreationModal({ projects, allTasks = [], onClose, onSubmit }) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    project_id: "",
    status: "todo",
    priority: "medium",
    estimated_hours: "",
    due_date: "",
    start_date: "",
    assignee: "",
    tags: [],
    dependencies: []
  });
  const [newTag, setNewTag] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskData.title && taskData.project_id) {
      onSubmit({
        ...taskData,
        estimated_hours: taskData.estimated_hours ? parseFloat(taskData.estimated_hours) : null
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !taskData.tags.includes(newTag.trim())) {
      setTaskData({
        ...taskData,
        tags: [...taskData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTaskData({
      ...taskData,
      tags: taskData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const analyzeWithAI = async () => {
    if (!taskData.title) return;
    
    setIsAnalyzing(true);
    setShowAIPanel(true);
    try {
      const selectedProject = projects.find(p => p.id === taskData.project_id);
      const projectContext = selectedProject ? `${selectedProject.title}: ${selectedProject.description || ''}` : '';

      const [complexity, prediction, subtasks] = await Promise.all([
        analyzeTaskComplexity(taskData),
        predictCompletionTime(taskData, 'intermediate'),
        generateSubtasks(taskData, projectContext)
      ]);

      setAiInsights({
        complexity,
        prediction,
        originalEstimate: taskData.estimated_hours
      });

      setSuggestedSubtasks(subtasks);

      // Auto-update estimated hours if prediction is available
      if (prediction?.predicted_hours && !taskData.estimated_hours) {
        setTaskData(prev => ({
          ...prev,
          estimated_hours: prediction.predicted_hours.toString()
        }));
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySubtasks = () => {
    // Store subtasks to be created after main task
    setTaskData(prev => ({
      ...prev,
      _subtasks: suggestedSubtasks
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskData.description}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                placeholder="Task description..."
                className="h-20"
              />
              {taskData.title && taskData.description && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={analyzeWithAI}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Select value={taskData.project_id} onValueChange={(value) => setTaskData({...taskData, project_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={taskData.status} onValueChange={(value) => setTaskData({...taskData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={taskData.priority} onValueChange={(value) => setTaskData({...taskData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                value={taskData.estimated_hours}
                onChange={(e) => setTaskData({...taskData, estimated_hours: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={taskData.start_date}
                onChange={(e) => setTaskData({...taskData, start_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={taskData.due_date}
                onChange={(e) => setTaskData({...taskData, due_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={taskData.assignee}
                onChange={(e) => setTaskData({...taskData, assignee: e.target.value})}
                placeholder="Assign to..."
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Dependencies (Tasks that must finish first)</Label>
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (!taskData.dependencies.includes(value)) {
                    setTaskData({...taskData, dependencies: [...taskData.dependencies, value]});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add dependency..." />
                </SelectTrigger>
                <SelectContent>
                  {allTasks
                    .filter(t => t.project_id === taskData.project_id && !taskData.dependencies.includes(t.id))
                    .map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {taskData.dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {taskData.dependencies.map((depId) => {
                    const depTask = allTasks.find(t => t.id === depId);
                    return depTask ? (
                      <Badge key={depId} variant="outline" className="gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {depTask.title}
                        <button
                          type="button"
                          onClick={() => setTaskData({
                            ...taskData, 
                            dependencies: taskData.dependencies.filter(id => id !== depId)
                          })}
                          className="hover:bg-slate-300 rounded-full p-0.5 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {taskData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {taskData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-slate-300 rounded-full p-0.5 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showAIPanel && aiInsights && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Insights
                </h3>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="complexity">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Complexity Analysis
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {aiInsights.complexity && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Overall Complexity:</span>
                          <Badge variant={
                            aiInsights.complexity.overall_complexity === 'high' || aiInsights.complexity.overall_complexity === 'very_high' 
                              ? 'destructive' 
                              : aiInsights.complexity.overall_complexity === 'medium' 
                                ? 'default' 
                                : 'secondary'
                          }>
                            {aiInsights.complexity.overall_complexity}
                          </Badge>
                        </div>
                        {aiInsights.complexity.key_challenges?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-slate-700">Key Challenges:</span>
                            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                              {aiInsights.complexity.key_challenges.map((challenge, idx) => (
                                <li key={idx}>{challenge}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {aiInsights.complexity.recommended_approach && (
                          <Alert>
                            <AlertDescription className="text-sm">
                              <strong>Recommended Approach:</strong> {aiInsights.complexity.recommended_approach}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prediction">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time Prediction
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {aiInsights.prediction && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-xs text-slate-600">Predicted Hours</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {aiInsights.prediction.predicted_hours}h
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-xs text-slate-600">Confidence</div>
                            <div className="text-2xl font-bold text-purple-600 capitalize">
                              {aiInsights.prediction.confidence_level}
                            </div>
                          </div>
                        </div>
                        {aiInsights.prediction.reasoning && (
                          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                            {aiInsights.prediction.reasoning}
                          </div>
                        )}
                        {aiInsights.prediction.risk_factors?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-slate-700">Risk Factors:</span>
                            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                              {aiInsights.prediction.risk_factors.map((risk, idx) => (
                                <li key={idx}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {suggestedSubtasks.length > 0 && (
                  <AccordionItem value="subtasks">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Suggested Subtasks ({suggestedSubtasks.length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {suggestedSubtasks.map((subtask, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="font-medium text-slate-900">{subtask.title}</div>
                            <div className="text-sm text-slate-600 mt-1">{subtask.description}</div>
                            <div className="text-xs text-slate-500 mt-2">
                              Est. {subtask.estimated_hours}h
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={applySubtasks}
                          className="w-full"
                        >
                          Apply Subtasks (will be created after main task)
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!taskData.title || !taskData.project_id}
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}