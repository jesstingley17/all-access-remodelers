import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import AIJobOptimizer from "../components/cleaning/AIJobOptimizer";
import AIPricingPredictor from "../components/cleaning/AIPricingPredictor";
import AIClientRiskAnalyzer from "../components/cleaning/AIClientRiskAnalyzer";
import AIDynamicRescheduler from "../components/cleaning/AIDynamicRescheduler";
import AIFollowUpGenerator from "../components/communication/AIFollowUpGenerator";
import AIPromotionalGenerator from "../components/communication/AIPromotionalGenerator";
import AIRouteOptimizer from "../components/cleaning/AIRouteOptimizer";
import AISchedulingAssistant from "../components/cleaning/AISchedulingAssistant";
import AIStaffPerformanceAnalyzer from "../components/cleaning/AIStaffPerformanceAnalyzer";

export default function CleaningAI() {
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [staff, setStaff] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentCompletedJob, setRecentCompletedJob] = useState(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [jobsData, clientsData, locationsData, servicesData, feedbackData, staffData, timeData] = await Promise.all([
        base44.entities.CleaningJob.filter(userFilter),
        base44.entities.CleaningClient.filter(userFilter),
        base44.entities.ClientLocation.filter(userFilter),
        base44.entities.ServiceType.filter(userFilter),
        base44.entities.ClientFeedback.list(),
        base44.entities.User.list(),
        base44.entities.StaffTimeEntry.filter(userFilter)
      ]);

      setJobs(jobsData || []);
      setClients(clientsData || []);
      setLocations(locationsData || []);
      setServices(servicesData || []);
      setFeedback(feedbackData || []);
      setTimeEntries(timeData || []);
      
      const cleaningStaff = staffData.filter(s => s.staff_role);
      setStaff(cleaningStaff || []);

      const completedJobs = jobsData.filter(j => j.status === 'completed')
        .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
      setRecentCompletedJob(completedJobs[0] || null);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading AI tools...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Operations Hub
          </h1>
          <p className="text-slate-600 mt-1">Optimize scheduling, pricing, and client retention with AI</p>
        </div>

        <AISchedulingAssistant 
          jobs={jobs}
          staff={staff}
          locations={locations}
          clients={clients}
          onRefresh={loadData}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIJobOptimizer 
            jobs={jobs}
            clients={clients}
            locations={locations}
            services={services}
            onRefresh={loadData}
          />

          <AIPricingPredictor 
            services={services}
            locations={locations}
          />

          <AIDynamicRescheduler 
            jobs={jobs}
            locations={locations}
            services={services}
            onRefresh={loadData}
          />

          {recentCompletedJob && (
            <AIFollowUpGenerator 
              job={recentCompletedJob}
              client={clients.find(c => c.id === recentCompletedJob.client_id)}
              feedback={feedback.find(f => f.job_id === recentCompletedJob.id)}
            />
          )}

          <AIPromotionalGenerator 
            clients={clients}
            jobs={jobs}
            services={services}
          />

          <AIRouteOptimizer 
            jobs={jobs}
            locations={locations}
            staff={staff}
          />

          <AIStaffPerformanceAnalyzer 
            staff={staff}
            jobs={jobs}
            timeEntries={timeEntries}
            feedback={feedback}
          />

          <div className="lg:col-span-2">
            <AIClientRiskAnalyzer 
              clients={clients}
              jobs={jobs}
              feedback={feedback}
              onRefresh={loadData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}