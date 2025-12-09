import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, AlertTriangle, FileText, CheckSquare, Plus, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ConstructionDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [projectsData, tasksData, incidentsData, documentsData] = await Promise.all([
        base44.entities.Project.filter(userFilter),
        base44.entities.ConstructionTask.filter(userFilter),
        base44.entities.SafetyIncident.filter(userFilter),
        base44.entities.ConstructionDocument.filter(userFilter)
      ]);

      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setIncidents(incidentsData || []);
      setDocuments(documentsData || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
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
        <p className="text-lg text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const tasksDueToday = tasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false;
    return new Date(t.due_date).toDateString() === new Date().toDateString();
  }).length;
  const openIncidents = incidents.filter(i => i.status !== 'closed').length;
  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Construction Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {currentUser?.full_name}</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl("ProjectsList")}>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{activeProjects}</div>
                  <div className="text-sm text-slate-600">Active Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{tasksDueToday}</div>
                  <div className="text-sm text-slate-600">Tasks Due Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{openIncidents}</div>
                  <div className="text-sm text-slate-600">Open Incidents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
                  <div className="text-sm text-slate-600">Documents</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.filter(p => p.status === 'active').slice(0, 5).map(project => (
                <Link key={project.id} to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                  <div className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer border-b last:border-0">
                    <div className="font-medium text-slate-900">{project.name}</div>
                    <div className="text-sm text-slate-600">{project.code}</div>
                  </div>
                </Link>
              ))}
              {projects.filter(p => p.status === 'active').length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No active projects</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {recentDocuments.map(doc => (
                <div key={doc.id} className="p-3 border-b last:border-0">
                  <div className="font-medium text-slate-900">{doc.name}</div>
                  <div className="text-sm text-slate-600">{doc.type}</div>
                </div>
              ))}
              {recentDocuments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No documents yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}