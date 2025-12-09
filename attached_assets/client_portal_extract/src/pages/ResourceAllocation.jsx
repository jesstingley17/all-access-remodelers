import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
import AIResourceOptimizer from "../components/resource-allocation/AIResourceOptimizer";

export default function ResourceAllocation() {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    const loadData = useCallback(async () => {
        if (!currentUser) return;
        
        setIsLoading(true);
        try {
            const userFilter = { created_by: currentUser.email };
            const [projectsData, tasksData, usersData] = await Promise.all([
                base44.entities.Project.filter(userFilter),
                base44.entities.Task.filter(userFilter),
                base44.entities.User.list()
            ]);

            setProjects(projectsData || []);
            setTasks(tasksData || []);
            setTeamMembers(usersData || []);
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-lg text-slate-600">Loading resource data...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-7xl mx-auto text-center py-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
                    <p className="text-slate-600">Please log in to access resource allocation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        Resource Allocation
                    </h1>
                    <p className="text-slate-600 mt-1 font-medium">
                        AI-powered workload optimization and task assignment recommendations
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-sm text-slate-600 mb-1">Team Members</div>
                            <div className="text-3xl font-bold text-slate-900">{teamMembers.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-sm text-slate-600 mb-1">Active Projects</div>
                            <div className="text-3xl font-bold text-slate-900">
                                {projects.filter(p => p.status === 'active').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-sm text-slate-600 mb-1">Open Tasks</div>
                            <div className="text-3xl font-bold text-slate-900">
                                {tasks.filter(t => t.status !== 'completed').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AIResourceOptimizer 
                    projects={projects}
                    tasks={tasks}
                    teamMembers={teamMembers}
                    onRefresh={loadData}
                />
            </div>
        </div>
    );
}