import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        const mode = user.business_mode || 'construction';
        
        if (mode === 'cleaning') {
          navigate(createPageUrl('CleaningDashboard'));
        } else {
          navigate(createPageUrl('ConstructionDashboard'));
        }
      } catch (e) {
        window.location.href = '/Landing';
      }
    };
    initialize();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    </div>
  );
}