import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, AlertTriangle, Users, FileText } from "lucide-react";
import AIRiskAnalyzer from "../components/ai-assistant/AIRiskAnalyzer";
import AIResourceOptimizer from "../components/ai-assistant/AIResourceOptimizer";
import AIProjectReportGenerator from "../components/ai-assistant/AIProjectReportGenerator";
import AIProactiveInsights from "../components/ai-assistant/AIProactiveInsights";

export default function AIProjectAssistant() {
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [projectsData, tasksData, timeData, clientsData, expensesData] = await Promise.all([
        base44.entities.Project.filter(userFilter),
        base44.entities.Task.filter(userFilter),
        base44.entities.TimeEntry.filter(userFilter),
        base44.entities.Client.filter(userFilter),
        base44.entities.Expense.filter(userFilter)
      ]);

      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setTimeEntries(timeData || []);
      setClients(clientsData || []);
      setExpenses(expensesData || []);
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
        <p className="text-lg text-slate-600">Loading AI Assistant...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Project Assistant
          </h1>
          <p className="text-slate-600 mt-1">Proactive insights, risk detection, and intelligent recommendations</p>
        </div>

        <AIProactiveInsights 
          projects={projects}
          tasks={tasks}
          timeEntries={timeEntries}
          expenses={expenses}
        />

        <Tabs defaultValue="risks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Resource Optimization
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Manager Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="risks" className="mt-6">
            <AIRiskAnalyzer 
              projects={projects}
              tasks={tasks}
              timeEntries={timeEntries}
              expenses={expenses}
            />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <AIResourceOptimizer 
              projects={projects}
              tasks={tasks}
              timeEntries={timeEntries}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <AIProjectReportGenerator 
              projects={projects}
              tasks={tasks}
              timeEntries={timeEntries}
              clients={clients}
              expenses={expenses}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}