import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Mail, 
  Phone, 
  Star, 
  DollarSign,
  User,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClientCard({ client }) {
  const tierColors = {
    A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    B: 'bg-blue-100 text-blue-800 border-blue-200',
    C: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-100 text-slate-800',
    prospect: 'bg-blue-100 text-blue-800',
    archived: 'bg-amber-100 text-amber-800'
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                client.client_tier === 'A' ? 'bg-emerald-100' :
                client.client_tier === 'B' ? 'bg-blue-100' : 'bg-slate-100'
              }`}>
                <Building2 className={`w-6 h-6 ${
                  client.client_tier === 'A' ? 'text-emerald-600' :
                  client.client_tier === 'B' ? 'text-blue-600' : 'text-slate-600'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-slate-700 transition-colors">
                  {client.company_name}
                </h3>
                <p className="text-sm text-slate-600">{client.industry}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={tierColors[client.client_tier] || tierColors.B}>
                Tier {client.client_tier}
              </Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span className="font-medium">{client.primary_contact_name}</span>
              <span className="text-slate-400">•</span>
              <span>{client.primary_contact_role}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4" />
              <span>{client.primary_contact_email}</span>
            </div>
            {client.primary_contact_phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{client.primary_contact_phone}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                <Star className="w-4 h-4" />
                <span className="font-bold">{client.satisfaction_score || 0}/10</span>
              </div>
              <div className="text-xs text-slate-500">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-900 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">${(client.total_revenue || 0).toLocaleString()}</span>
              </div>
              <div className="text-xs text-slate-500">Revenue</div>
            </div>
          </div>

          {/* Status and Action */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <Badge variant="outline" className={statusColors[client.relationship_status] || statusColors.prospect}>
              {client.relationship_status}
            </Badge>
            <Link to={createPageUrl(`ClientProfile/${client.id}`)}>
              <Button variant="outline" size="sm" className="group-hover:bg-slate-100">
                View Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}