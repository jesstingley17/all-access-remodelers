import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, ShieldAlert, CheckSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MobileTaskPhotoUpload from "../components/mobile/MobileTaskPhotoUpload";
import AISafetyPhotoAnalyzer from "../components/mobile/AISafetyPhotoAnalyzer";

export default function MobileConstructionSupervisor() {
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const userFilter = { created_by: currentUser.email };
      const [projectsData, tasksData] = await Promise.all([
        base44.entities.Project.filter(userFilter),
        base44.entities.ConstructionTask.filter(userFilter)
      ]);

      setProjects(projectsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600">Please log in</p>
      </div>
    );
  }

  const projectTasks = selectedProject 
    ? tasks.filter(t => t.project_id === selectedProject)
    : [];

  const selectedTaskObj = tasks.find(t => t.id === selectedTask);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Supervisor Tools</h1>
          <p className="text-slate-600">{currentUser.full_name}</p>
        </div>

        <Tabs defaultValue="task-photos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="task-photos" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Task Photos
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Safety Check
            </TabsTrigger>
          </TabsList>

          <TabsContent value="task-photos" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p.status === 'active').map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Task</label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose task" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedTaskObj && (
              <MobileTaskPhotoUpload 
                task={selectedTaskObj}
                onUploadComplete={loadData}
              />
            )}
          </TabsContent>

          <TabsContent value="safety" className="mt-4">
            <AISafetyPhotoAnalyzer projectId={selectedProject} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}