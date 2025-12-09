import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Headset } from "lucide-react";
import AICustomerChatbot from "../components/support/AICustomerChatbot";
import AIFeedbackAnalyzer from "../components/support/AIFeedbackAnalyzer";

export default function CustomerSupport() {
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [jobsData, clientsData, feedbackData] = await Promise.all([
        base44.entities.CleaningJob.filter(userFilter),
        base44.entities.CleaningClient.filter(userFilter),
        base44.entities.ClientFeedback.list()
      ]);

      setJobs(jobsData || []);
      setClients(clientsData || []);
      setFeedback(feedbackData || []);
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
        <p className="text-lg text-slate-600">Loading support tools...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Headset className="w-8 h-8 text-blue-600" />
            Customer Support Center
          </h1>
          <p className="text-slate-600 mt-1">AI-powered chatbot and feedback analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AICustomerChatbot 
            clientEmail={currentUser?.email}
            jobs={jobs}
            clients={clients}
          />

          <div className="lg:col-span-1">
            <AIFeedbackAnalyzer 
              feedback={feedback}
              jobs={jobs}
              clients={clients}
            />
          </div>
        </div>
      </div>
    </div>
  );
}