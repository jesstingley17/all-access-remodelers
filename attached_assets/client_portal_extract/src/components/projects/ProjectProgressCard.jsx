import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { CheckSquare, ListTodo } from 'lucide-react';

export default function ProjectProgressCard({ project, tasks, onUpdate }) {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const handleProgressChange = (value) => {
    onUpdate({ completion_percentage: value[0] });
  };
  
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CheckSquare className="w-5 h-5"/>Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Progress</span>
            <span className="text-lg font-bold text-slate-900">{project.completion_percentage || 0}%</span>
          </div>
          <Progress value={project.completion_percentage || 0} className="h-3" />
        </div>
        <div className="pt-2">
          <label className="text-sm font-medium text-slate-700">Manually Adjust Progress</label>
          <Slider
            defaultValue={[project.completion_percentage || 0]}
            max={100}
            step={1}
            onValueCommit={handleProgressChange}
            className="mt-3"
          />
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ListTodo className="w-4 h-4" />
            <span>Task Completion</span>
          </div>
          <span className="font-bold text-slate-900">{completedTasks} / {totalTasks}</span>
        </div>
      </CardContent>
    </Card>
  );
}