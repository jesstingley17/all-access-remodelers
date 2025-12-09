import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

const PROJECT_TYPES = [
  { value: "web_design", label: "Web Design" },
  { value: "web_development", label: "Web Development" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "content_writing", label: "Content Writing" },
  { value: "copywriting", label: "Copywriting" },
  { value: "seo", label: "SEO" },
  { value: "social_media", label: "Social Media" },
  { value: "consulting", label: "Consulting" },
  { value: "branding", label: "Branding" },
  { value: "ui_ux_design", label: "UI/UX Design" },
  { value: "e_commerce", label: "E-commerce" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" }
];

export default function ProjectFilters({ filters, onFilterChange, clients }) {
  const handleFilterChange = (type, value) => {
    onFilterChange({
      ...filters,
      [type]: value
    });
  };

  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="w-32 bg-white border-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
        <SelectTrigger className="w-32 bg-white border-slate-200">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.project_type} onValueChange={(value) => handleFilterChange("project_type", value)}>
        <SelectTrigger className="w-40 bg-white border-slate-200">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {PROJECT_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.client_id} onValueChange={(value) => handleFilterChange("client_id", value)}>
        <SelectTrigger className="w-40 bg-white border-slate-200">
          <SelectValue placeholder="Client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.company_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}