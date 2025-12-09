import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Project, Client, Task, TimeEntry, User, ProjectAudit } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

import ProjectDetailHeader from '../components/projects/ProjectDetailHeader';
import ProjectProgressCard from '../components/projects/ProjectProgressCard';
import ProjectFinancialsCard from '../components/projects/ProjectFinancialsCard';
import ProjectTasksList from '../components/projects/ProjectTasksList';
import ProjectAuditModal from '../components/projects/ProjectAuditModal';
import ProjectFeedbackModal from '../components/feedback/ProjectFeedbackModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const loadProjectData = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (!user) {
        setIsLoading(false);
        return;
      }

      const userFilter = { created_by: user.email };
      const projectData = await Project.filter({ id: id, ...userFilter });
      const currentProject = projectData && projectData[0];

      if (!currentProject) {
        setProject(null);
        setIsLoading(false);
        return;
      }
      
      setProject(currentProject);

      const [clientData, projectTasks, projectTimeEntries] = await Promise.all([
        currentProject.client_id ? Client.filter({ id: currentProject.client_id, ...userFilter }) : Promise.resolve([]),
        Task.filter({ project_id: id, ...userFilter }),
        TimeEntry.filter({ project_id: id, ...userFilter })
      ]);

      setClient(clientData && clientData[0] ? clientData[0] : null);
      setTasks(projectTasks || []);
      setTimeEntries(projectTimeEntries || []);

    } catch (error) {
      console.error("Error loading project details:", error);
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const onUpdate = () => {
    loadProjectData(); // Re-fetch all data on update
  };
  
  const onAuditComplete = async (auditData) => {
    try {
      await ProjectAudit.create(auditData);
      setIsAuditModalOpen(false);
      // Potentially show a success message
    } catch (error) {
      console.error("Failed to save project audit:", error);
    }
  };

  if (isLoading) return <div className="p-6">Loading project details...</div>;
  if (!currentUser) return <div className="p-6 text-center">Please log in to view project details.</div>;
  if (!project) return <div className="p-6 text-center">Project not found or you do not have access.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link to={createPageUrl('Projects')}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{project.title}</h1>
            <p className="text-slate-600 mt-1 font-medium">Project command center</p>
          </div>
        </div>

        <ProjectDetailHeader 
          project={project}
          client={client}
          tasks={tasks}
          timeEntries={timeEntries}
          onUpdate={onUpdate}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        />
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectTasksList tasks={tasks} onUpdate={onUpdate} projectId={project.id} />
          </div>
          <div className="space-y-6">
            <ProjectProgressCard project={project} tasks={tasks} onUpdate={onUpdate} />
            <ProjectFinancialsCard project={project} timeEntries={timeEntries} />
          </div>
        </div>
        
        {isAuditModalOpen && (
          <ProjectAuditModal
            project={project}
            tasks={tasks}
            client={client}
            onClose={() => setIsAuditModalOpen(false)}
            onComplete={onAuditComplete}
          />
        )}

        {isFeedbackModalOpen && (
          <ProjectFeedbackModal
            project={project}
            onClose={() => setIsFeedbackModalOpen(false)}
            onRefresh={onUpdate}
          />
        )}
      </div>
    </div>
  );
}