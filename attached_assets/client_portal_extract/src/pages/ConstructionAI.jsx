import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import AITaskEstimator from "../components/construction/AITaskEstimator";
import AIProjectRiskPredictor from "../components/construction/AIProjectRiskPredictor";
import AISubcontractorMatcher from "../components/construction/AISubcontractorMatcher";
import AISitePhotoAnalyzer from "../components/construction/AISitePhotoAnalyzer";
import AITaskSequencer from "../components/construction/AITaskSequencer";
import AIProjectStatusGenerator from "../components/communication/AIProjectStatusGenerator";

export default function ConstructionAI() {
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [subcontractors, setSubcontractors] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [projectsData, tasksData, timeData, subcontractorsData, clientsData] = await Promise.all([
        base44.entities.Project.filter(userFilter),
        base44.entities.Task.filter(userFilter),
        base44.entities.TimeEntry.filter(userFilter),
        base44.entities.Subcontractor.filter(userFilter),
        base44.entities.ConstructionClient.filter(userFilter)
      ]);

      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setTimeEntries(timeData || []);
      setSubcontractors(subcontractorsData || []);
      setClients(clientsData || []);

      const activeProjects = projectsData.filter(p => p.status === 'active');
      setActiveProject(activeProjects[0] || null);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading AI tools...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Construction Intelligence
          </h1>
          <p className="text-slate-600 mt-1">Advanced AI tools for estimation, risk prediction, and site analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AITaskEstimator projects={projects} />
          
          <AIProjectRiskPredictor 
            projects={projects}
            tasks={tasks}
            timeEntries={timeEntries}
          />

          <AITaskSequencer 
            projects={projects}
            tasks={tasks}
            timeEntries={timeEntries}
          />

          <AISubcontractorMatcher 
            tasks={tasks}
            subcontractors={subcontractors}
          />

          <AISitePhotoAnalyzer />

          {activeProject && (
            <AIProjectStatusGenerator 
              project={activeProject}
              tasks={tasks.filter(t => t.project_id === activeProject.id)}
              timeEntries={timeEntries.filter(t => t.project_id === activeProject.id)}
              client={clients.find(c => c.id === activeProject.client_id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}