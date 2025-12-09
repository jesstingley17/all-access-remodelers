import React, { useState, useEffect, useCallback } from "react";
import { Project } from "@/api/entities";
import { Client } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus,
  FolderOpen,
  Calendar,
  DollarSign,
  Clock,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ProjectCard from "../components/projects/ProjectCard";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectDashboardStats from "../components/projects/ProjectDashboardStats";
import ProjectBudgetChart from "../components/projects/ProjectBudgetChart";
import ProjectTimelineView from "../components/projects/ProjectTimelineView";
import EnhancedProjectCard from "../components/projects/EnhancedProjectCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    project_type: "all",
    client_id: "all"
  });
  const [sortBy, setSortBy] = useState("-updated_date");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [projectsData, clientsData] = await Promise.all([
        Project.filter(userFilter, "-updated_date"),
        Client.filter(userFilter, "-updated_date")
      ]);
      setProjects(projectsData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setProjects([]);
      setClients([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...projects];

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(project => project.status === filters.status);
    }
    if (filters.priority !== "all") {
      filtered = filtered.filter(project => project.priority === filters.priority);
    }
    if (filters.project_type !== "all") {
      filtered = filtered.filter(project => project.project_type === filters.project_type);
    }
    if (filters.client_id !== "all") {
      filtered = filtered.filter(project => project.client_id === filters.client_id);
    }

    // Apply sorting
    if (sortBy === "due_date") {
      filtered.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
    } else if (sortBy === "-due_date") {
      filtered.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date) - new Date(a.due_date);
      });
    } else if (sortBy === "budget") {
      filtered.sort((a, b) => (a.budget || 0) - (b.budget || 0));
    } else if (sortBy === "-budget") {
      filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    } else if (sortBy === "title") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "-updated_date") {
      filtered.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, filters, sortBy]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Error fetching user:", e);
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

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const clientMap = React.useMemo(() => {
    const map = {};
    clients.forEach(client => {
      map[client.id] = client;
    });
    return map;
  }, [clients]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-lg text-slate-700">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to manage your projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
            <p className="text-slate-600 mt-1 font-medium">Manage and track all your projects</p>
          </div>
          <Link to={createPageUrl("ProjectWizard")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        <ProjectDashboardStats projects={projects} />

        <div className="grid lg:grid-cols-2 gap-6">
          <ProjectBudgetChart projects={projects} />
          <ProjectTimelineView projects={projects} />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search projects by name, description, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white border-slate-200 focus:border-slate-400"
              />
            </div>
            <ProjectFilters 
              filters={filters}
              onFilterChange={setFilters}
              clients={clients}
            />
          </div>
          
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </h2>
              {(searchQuery || Object.values(filters).some(f => f !== "all")) && (
                <Badge variant="outline" className="text-slate-600">
                  Filtered
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-md text-sm bg-white"
              >
                <option value="-updated_date">Recently Updated</option>
                <option value="due_date">Due Date (Earliest)</option>
                <option value="-due_date">Due Date (Latest)</option>
                <option value="-budget">Budget (High to Low)</option>
                <option value="budget">Budget (Low to High)</option>
                <option value="title">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <EnhancedProjectCard 
                key={project.id} 
                project={project} 
                client={clientMap[project.client_id]}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No projects found</h3>
              <p className="text-slate-500 mb-6">
                {searchQuery || Object.values(filters).some(f => f !== "all")
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first project"
                }
              </p>
              <Link to={createPageUrl("ProjectWizard")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}