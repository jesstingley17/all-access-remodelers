import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  ArrowLeft, 
  Wand2,
  Calendar,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  User,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";

const PROJECT_TYPE_LABELS = {
  web_design: "Web Design",
  web_development: "Web Development",
  mobile_app: "Mobile App",
  content_writing: "Content Writing",
  copywriting: "Copywriting",
  seo: "SEO",
  social_media: "Social Media",
  consulting: "Consulting",
  branding: "Branding",
  ui_ux_design: "UI/UX Design",
  e_commerce: "E-commerce",
  maintenance: "Maintenance",
  other: "Other"
};

const PRIORITY_COLORS = {
  low: "bg-slate-100 text-slate-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-amber-100 text-amber-800",
  urgent: "bg-red-100 text-red-800"
};

const RISK_COLORS = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800"
};

export default function ProjectSummary({ 
  data, 
  clients, 
  onSubmit, 
  onPrev, 
  onGenerateTasks,
  isSubmitting,
  isGeneratingTasks 
}) {
  const client = clients.find(c => c.id === data.client_id);
  
  const handleCreateWithTasks = async () => {
    const taskSuggestions = await onGenerateTasks();
    onSubmit(taskSuggestions);
  };

  const overallRisk = data.risk_assessment?.overall_risk || 
    (data.risk_assessment ? 
      ((data.risk_assessment.scope_clarity + data.risk_assessment.client_experience + 
        data.risk_assessment.technical_complexity + data.risk_assessment.timeline_pressure) / 4 >= 4 ? 'high' :
       (data.risk_assessment.scope_clarity + data.risk_assessment.client_experience + 
        data.risk_assessment.technical_complexity + data.risk_assessment.timeline_pressure) / 4 >= 3 ? 'medium' : 'low')
      : 'medium');

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <CheckCircle className="w-5 h-5" />
          Project Summary
        </CardTitle>
        <p className="text-sm text-slate-600">
          Review your project details before creation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Overview */}
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{data.title}</h2>
              <p className="text-slate-600 leading-relaxed">{data.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={PRIORITY_COLORS[data.priority]}>
                {data.priority} priority
              </Badge>
              <Badge className={RISK_COLORS[overallRisk]}>
                {overallRisk} risk
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {client && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">{client.company_name}</div>
                    <div className="text-sm text-slate-600">{client.primary_contact_name}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="font-medium text-slate-900">
                    {PROJECT_TYPE_LABELS[data.project_type]}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {data.budget > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">${data.budget.toLocaleString()}</div>
                    <div className="text-sm text-slate-600">Project budget</div>
                  </div>
                </div>
              )}
              {data.estimated_hours > 0 && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-900">{data.estimated_hours} hours</div>
                    <div className="text-sm text-slate-600">Estimated time</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {(data.start_date || data.due_date) && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Project Timeline</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {data.start_date && (
                <div>
                  <div className="text-sm text-blue-700">Start Date</div>
                  <div className="font-medium text-blue-900">
                    {format(new Date(data.start_date), 'MMMM d, yyyy')}
                  </div>
                </div>
              )}
              {data.due_date && (
                <div>
                  <div className="text-sm text-blue-700">Due Date</div>
                  <div className="font-medium text-blue-900">
                    {format(new Date(data.due_date), 'MMMM d, yyyy')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deliverables */}
        {data.deliverables && data.deliverables.length > 0 && (
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-emerald-900">
                Deliverables ({data.deliverables.length})
              </h3>
            </div>
            <div className="space-y-2">
              {data.deliverables.slice(0, 3).map((deliverable, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-800">{deliverable.title}</span>
                </div>
              ))}
              {data.deliverables.length > 3 && (
                <div className="text-sm text-emerald-700">
                  +{data.deliverables.length - 3} more deliverables
                </div>
              )}
            </div>
          </div>
        )}

        {/* Milestones */}
        {data.milestones && data.milestones.length > 0 && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">
                Milestones ({data.milestones.length})
              </h3>
            </div>
            <div className="space-y-2">
              {data.milestones.slice(0, 3).map((milestone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-800">{milestone.title}</span>
                </div>
              ))}
              {data.milestones.length > 3 && (
                <div className="text-sm text-purple-700">
                  +{data.milestones.length - 3} more milestones
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {data.risk_assessment && (
          <div className={`p-4 rounded-lg border ${RISK_COLORS[overallRisk].replace('text-', 'border-').replace('800', '200')} ${RISK_COLORS[overallRisk].replace('text-', 'bg-').replace('800', '50')}`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-current" />
              <h3 className="font-semibold">Risk Assessment: {overallRisk.toUpperCase()}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>Scope Clarity: {data.risk_assessment.scope_clarity}/5</div>
              <div>Client Experience: {data.risk_assessment.client_experience}/5</div>
              <div>Technical Complexity: {data.risk_assessment.technical_complexity}/5</div>
              <div>Timeline Pressure: {data.risk_assessment.timeline_pressure}/5</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onPrev} size="lg" className="px-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => onSubmit()}
              disabled={isSubmitting || isGeneratingTasks}
              size="lg"
              className="px-6"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
            
            <Button 
              type="button"
              onClick={handleCreateWithTasks}
              disabled={isSubmitting || isGeneratingTasks}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isGeneratingTasks ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Tasks...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Create with AI Tasks
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}