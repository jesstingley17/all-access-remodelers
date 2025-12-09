import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ArrowRight, Briefcase } from "lucide-react";

const PROJECT_TYPES = [
  { value: "web_design", label: "Web Design", description: "UI/UX design, mockups, prototypes" },
  { value: "web_development", label: "Web Development", description: "Frontend, backend, full-stack development" },
  { value: "mobile_app", label: "Mobile App", description: "iOS, Android, cross-platform apps" },
  { value: "content_writing", label: "Content Writing", description: "Blog posts, articles, documentation" },
  { value: "copywriting", label: "Copywriting", description: "Marketing copy, sales pages, ads" },
  { value: "seo", label: "SEO", description: "Search engine optimization" },
  { value: "social_media", label: "Social Media", description: "Social media management and content" },
  { value: "consulting", label: "Consulting", description: "Strategic advice and planning" },
  { value: "branding", label: "Branding", description: "Logo, brand identity, guidelines" },
  { value: "ui_ux_design", label: "UI/UX Design", description: "User interface and experience design" },
  { value: "e_commerce", label: "E-commerce", description: "Online store development" },
  { value: "maintenance", label: "Maintenance", description: "Ongoing support and updates" },
  { value: "other", label: "Other", description: "Custom project type" }
];

export default function ProjectBasicsForm({ data, clients, onChange, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.title && data.client_id && data.project_type) {
      onNext();
    }
  };

  const selectedType = PROJECT_TYPES.find(type => type.value === data.project_type);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Briefcase className="w-5 h-5" />
          Project Basics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 font-medium">
                Project Title *
              </Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Enter project title"
                className="h-12 border-slate-200 focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id" className="text-slate-700 font-medium">
                Client *
              </Label>
              <Select value={data.client_id} onValueChange={(value) => onChange({ client_id: value })}>
                <SelectTrigger className="h-12 border-slate-200 focus:border-blue-400">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{client.company_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">
              Project Description
            </Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Describe the project goals, requirements, and key details..."
              className="h-24 border-slate-200 focus:border-blue-400 resize-none"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-slate-700 font-medium">Project Type *</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {PROJECT_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    data.project_type === type.value
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onChange({ project_type: type.value })}
                >
                  <div className="font-semibold text-slate-900">{type.label}</div>
                  <div className="text-sm text-slate-600 mt-1">{type.description}</div>
                </div>
              ))}
            </div>
            {selectedType && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-900">Selected: {selectedType.label}</div>
                <div className="text-sm text-blue-700 mt-1">{selectedType.description}</div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              disabled={!data.title || !data.client_id || !data.project_type}
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}