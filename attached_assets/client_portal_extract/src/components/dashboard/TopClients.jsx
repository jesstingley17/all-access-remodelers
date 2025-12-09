import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Building2, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopClients({ clients, isLoading }) {
  const topClients = clients
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
    .slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Crown className="w-5 h-5 text-amber-500" />
          Top Clients by Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : topClients.length > 0 ? (
            topClients.map((client, index) => (
              <div key={client.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-slate-200 text-slate-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{client.company_name}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {client.industry}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">${(client.total_revenue || 0).toLocaleString()}</div>
                  <Badge className={`text-xs ${
                    client.client_tier === 'A' ? 'bg-emerald-100 text-emerald-800' :
                    client.client_tier === 'B' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    Tier {client.client_tier}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">
              <Crown className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No revenue data available yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}