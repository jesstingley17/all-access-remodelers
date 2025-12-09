import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, DollarSign, Star, TrendingUp } from "lucide-react";

export default function ClientOverviewCard({ client, projects }) {
  const totalRevenue = client.total_revenue || 0;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Relationship Status</span>
          <Badge className={
            client.relationship_status === 'active' ? 'bg-emerald-100 text-emerald-800' :
            client.relationship_status === 'prospect' ? 'bg-blue-100 text-blue-800' :
            'bg-slate-100 text-slate-800'
          }>
            {client.relationship_status}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Industry</span>
          <span className="text-sm font-medium text-slate-900">{client.industry || 'N/A'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Company Size</span>
          <span className="text-sm font-medium text-slate-900 capitalize">{client.company_size || 'N/A'}</span>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-600">Active Projects</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{activeProjects}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-600">Total Revenue</span>
            </div>
            <span className="text-lg font-bold text-emerald-600">${totalRevenue.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-slate-600">Satisfaction</span>
            </div>
            <span className="text-lg font-bold text-amber-600">{client.satisfaction_score || 0}/10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}