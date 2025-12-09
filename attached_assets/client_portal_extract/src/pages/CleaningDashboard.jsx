import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, Star, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CleaningDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [jobsData, clientsData, feedbackData, invoicesData] = await Promise.all([
        base44.entities.CleaningJob.filter(userFilter),
        base44.entities.CleaningClient.filter(userFilter),
        base44.entities.ClientFeedback.list(),
        base44.entities.CleaningInvoice.filter(userFilter)
      ]);

      setJobs(jobsData || []);
      setClients(clientsData || []);
      setFeedback(feedbackData || []);
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
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
        <p className="text-lg text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  const today = new Date().toDateString();
  const todaysJobs = jobs.filter(j => {
    if (!j.scheduled_start_at) return false;
    return new Date(j.scheduled_start_at).toDateString() === today;
  });

  const activeClients = clients.filter(c => c.status === 'active').length;
  const avgRating = feedback.length > 0 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;
  
  const thisMonthRevenue = invoices
    .filter(inv => {
      if (!inv.issued_at || inv.status === 'void') return false;
      const invDate = new Date(inv.issued_at);
      const now = new Date();
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + (inv.amount_due || 0), 0);

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-amber-100 text-amber-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Construction Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {currentUser?.full_name}</p>
          </div>
          <Link to={createPageUrl("CleaningJobs")}>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{todaysJobs.length}</div>
                  <div className="text-sm text-slate-600">Today's Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{activeClients}</div>
                  <div className="text-sm text-slate-600">Active Clients</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">${thisMonthRevenue.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">This Month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{avgRating}</div>
                  <div className="text-sm text-slate-600">Avg Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysJobs.length > 0 ? (
                <div className="space-y-3">
                  {todaysJobs.map(job => (
                    <div key={job.id} className="p-3 bg-slate-50 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="font-medium text-slate-900">
                              {new Date(job.scheduled_start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600">Client ID: {job.client_id}</div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No jobs scheduled for today</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.slice(0, 5).map(fb => (
                <div key={fb.id} className="p-3 border-b last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Job ID: {fb.job_id}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{fb.rating}</span>
                    </div>
                  </div>
                  {fb.comment && (
                    <p className="text-sm text-slate-600 mt-1">{fb.comment}</p>
                  )}
                </div>
              ))}
              {feedback.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No feedback yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}