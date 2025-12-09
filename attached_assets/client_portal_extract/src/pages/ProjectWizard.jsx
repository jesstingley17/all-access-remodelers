import React, { useState, useEffect, useCallback } from "react";
import { Project } from "@/api/entities";
import { Client } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckSquare, Wand2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InvokeLLM } from "@/api/integrations";

import ProjectBasicsForm from "../components/wizard/ProjectBasicsForm";
import ScopeDefinitionForm from "../components/wizard/ScopeDefinitionForm";
import BudgetTimelineForm from "../components/wizard/BudgetTimelineForm";
import RiskAssessmentForm from "../components/wizard/RiskAssessmentForm";
import ProjectSummary from "../components/wizard/ProjectSummary";
import AIAnalysisSummary from "../components/wizard/AIAnalysisSummary";
import { automatedProjectOnboarding } from "../components/projects/ProjectOnboarding";

const WIZARD_STEPS = [
  { id: 'basics', title: 'Project Basics', description: 'Client and project type' },
  { id: 'scope', title: 'Scope & Deliverables', description: 'Define what will be delivered' },
  { id: 'budget', title: 'Budget & Timeline', description: 'Set financial and time parameters' },
  { id: 'risk', title: 'Risk Assessment', description: 'Evaluate project risks' },
  { id: 'summary', title: 'Review & Create', description: 'Final review and project creation' }
];

export default function ProjectWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [clients, setClients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    client_id: "",
    project_type: "web_design",
    deliverables: [],
    milestones: [],
    budget: 0,
    estimated_hours: 0,
    start_date: "",
    due_date: "",
    risk_assessment: {
      scope_clarity: 3,
      client_experience: 3,
      technical_complexity: 3,
      timeline_pressure: 3,
      overall_risk: "medium"
    },
    ai_analysis: null,
    client_access_enabled: false,
    priority: "medium",
    status: "planning",
    notes: ""
  });

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to fetch current user:", e);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const loadClients = useCallback(async () => {
    if (!currentUser) {
      setClients([]);
      return;
    }
    try {
      const userFilter = { created_by: currentUser.email };
      const clientsData = await Client.filter(userFilter, "-updated_date");
      setClients(clientsData || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadClients();
    }
  }, [currentUser, loadClients]);

  const updateProjectData = (updates) => {
    setProjectData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const analyzeProject = async () => {
    if (currentStep !== 3) return;
    setIsAnalyzing(true);
    updateProjectData({ ai_analysis: null });
    
    try {
        const prompt = `You are an expert freelance business consultant. Analyze this project plan and provide insights based on current market trends and best practices.
        
        Project Details:
        - Type: ${projectData.project_type}
        - Description: ${projectData.description}
        - Deliverables Count: ${projectData.deliverables.length}
        - Milestones Count: ${projectData.milestones.length}
        - Estimated Hours: ${projectData.estimated_hours}
        - Budget: $${projectData.budget}
        - Manual Risk Assessment:
            - Scope Clarity: ${projectData.risk_assessment.scope_clarity}/5
            - Client Experience: ${projectData.risk_assessment.client_experience}/5
            - Technical Complexity: ${projectData.risk_assessment.technical_complexity}/5
            - Timeline Pressure: ${projectData.risk_assessment.timeline_pressure}/5
        
        Based on current market conditions and industry standards for ${projectData.project_type} projects, analyze potential risks and provide realistic timeline suggestions. Consider that freelancers typically underestimate by 15-25%.`;

        const response = await InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    predicted_risk: { type: "string", enum: ["low", "medium", "high"] },
                    risk_factors: { type: "array", items: { type: "string" } },
                    suggested_buffer_hours: { type: "number" },
                    suggested_deadline: { type: "string", format: "date" },
                    confidence_score: { type: "number", minimum: 0, maximum: 100 },
                    market_insights: { type: "string" }
                },
                required: ["predicted_risk", "risk_factors", "suggested_buffer_hours", "suggested_deadline", "confidence_score"]
            }
        });
        
        updateProjectData({ ai_analysis: response });
    } catch (error) {
        console.error("Error analyzing project:", error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const generateTaskSuggestions = async () => {
    setIsGeneratingTasks(true);
    try {
      const prompt = `You are an expert project manager. Generate a comprehensive task breakdown for a ${projectData.project_type} project based on current industry best practices and workflows.
      
      Project: ${projectData.title}
      Description: ${projectData.description}
      Estimated Hours: ${projectData.estimated_hours}
      Deliverables: ${projectData.deliverables.map(d => d.title).join(', ')}
      
      Research current ${projectData.project_type} project methodologies and provide a detailed task structure with realistic time estimates. Include dependencies and prioritization based on industry standards.`;

      const response = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  estimated_hours: { type: "number" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  dependencies: { type: "array", items: { type: "string" } },
                  subtasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        estimated_hours: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      return response.tasks || [];
    } catch (error) {
      console.error("Error generating task suggestions:", error);
      return [];
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const handleSubmit = async (taskSuggestions = []) => {
    setIsSubmitting(true);
    try {
      const riskScores = projectData.risk_assessment;
      const avgRisk = (riskScores.scope_clarity + riskScores.client_experience + 
                      riskScores.technical_complexity + riskScores.timeline_pressure) / 4;
      
      const overallRisk = avgRisk >= 4 ? "high" : avgRisk >= 3 ? "medium" : "low";
      
      const finalProjectData = {
        ...projectData,
        risk_assessment: {
          ...projectData.risk_assessment,
          overall_risk: overallRisk
        }
      };

      const createdProject = await Project.create(finalProjectData);
      
      // Find the client for onboarding
      const client = clients.find(c => c.id === createdProject.client_id);
      
      // Trigger automated onboarding if client exists
      if (client) {
        await automatedProjectOnboarding(createdProject, client);
      }
      
      if (taskSuggestions.length > 0) {
        sessionStorage.setItem(`taskSuggestions_${createdProject.id}`, JSON.stringify(taskSuggestions));
      }
      
      navigate(createPageUrl(`ProjectDetail/${createdProject.id}`));
    } catch (error) {
      console.error("Error creating project:", error);
    }
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProjectBasicsForm 
            data={projectData} 
            clients={clients}
            onChange={updateProjectData}
            onNext={nextStep}
          />
        );
      case 1:
        return (
          <ScopeDefinitionForm 
            data={projectData} 
            onChange={updateProjectData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 2:
        return (
          <BudgetTimelineForm 
            data={projectData} 
            onChange={updateProjectData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <RiskAssessmentForm 
            data={projectData} 
            onChange={updateProjectData}
            onNext={nextStep}
            onPrev={prevStep}
            onAnalyze={analyzeProject}
            isAnalyzing={isAnalyzing}
          />
        );
      case 4:
        return (
          <ProjectSummary 
            data={projectData} 
            clients={clients}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            onGenerateTasks={generateTaskSuggestions}
            isSubmitting={isSubmitting}
            isGeneratingTasks={isGeneratingTasks}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading Project Wizard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Authentication Required</h2>
        <p className="text-slate-600 mb-6">Please log in to create and manage your projects.</p>
        <Link to={createPageUrl("Dashboard")}>
            <Button>Go to Dashboard to Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Projects")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Project</h1>
            <p className="text-slate-600 mt-1 font-medium">Step-by-step project setup with intelligent suggestions</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Step {currentStep + 1} of {WIZARD_STEPS.length}</CardTitle>
              <div className="text-sm text-slate-500 font-medium">
                {((currentStep + 1) / WIZARD_STEPS.length * 100).toFixed(0)}% Complete
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {WIZARD_STEPS.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {index < currentStep ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`font-medium text-xs ${
                        index <= currentStep ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500 hidden md:block">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {renderStepContent()}
        {currentStep === 3 && projectData.ai_analysis && (
            <AIAnalysisSummary analysis={projectData.ai_analysis} isLoading={isAnalyzing} />
        )}
      </div>
    </div>
  );
}