import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Star, 
  DollarSign, 
  ArrowRight,
  Building2,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientOverview({ clients, isLoading }) {
  const recentClients = clients.slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="w-5 h-5" />
            Recent Clients
          </CardTitle>
          <Link to={createPageUrl("ClientList")}>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 animate-pulse">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-2" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : recentClients.length > 0 ? (
            recentClients.map((client) => (
              <Link key={client.id} to={createPageUrl(`ClientProfile/${client.id}`)}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
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
                      <div className="font-semibold text-slate-900">{client.company_name}</div>
                      <div className="text-sm text-slate-600">{client.primary_contact_name} • {client.industry}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${
                      client.client_tier === 'A' ? 'bg-emerald-100 text-emerald-800' :
                      client.client_tier === 'B' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      Tier {client.client_tier}
                    </Badge>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {client.satisfaction_score || 0}/10
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No clients yet. Add your first client to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}