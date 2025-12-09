import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function TaskFilters({ filters, onFilterChange, projects, tasks }) {
  const handleFilterChange = (type, value) => {
    onFilterChange({
      ...filters,
      [type]: value
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      project: "all",
      priority: "all",
      status: "all",
      assignee: "all"
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "all");
  const assignees = [...new Set(tasks.map(t => t.assignee).filter(Boolean))];

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-0">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Filters:</span>
            
            <Select value={filters.project} onValueChange={(value) => handleFilterChange("project", value)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {assignees.length > 0 && (
              <Select value={filters.assignee} onValueChange={(value) => handleFilterChange("assignee", value)}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {hasActiveFilters && (
            <>
              <div className="flex items-center gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (value === "all") return null;
                  
                  let displayValue = value;
                  if (key === "project") {
                    const project = projects.find(p => p.id === value);
                    displayValue = project?.title || value;
                  }
                  
                  return (
                    <Badge key={key} variant="secondary" className="gap-1">
                      <span className="capitalize">{key}: {displayValue}</span>
                      <button
                        onClick={() => handleFilterChange(key, "all")}
                        className="hover:bg-slate-300 rounded-full p-0.5 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                }).filter(Boolean)}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-9"
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}