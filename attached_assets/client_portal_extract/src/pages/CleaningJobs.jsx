import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, List, Clock, MapPin, MessageSquare, Receipt, DollarSign } from "lucide-react";
import JobCreateModal from "../components/cleaning/JobCreateModal";
import CleaningFeedbackModal from "../components/feedback/CleaningFeedbackModal";
import AIInvoiceGenerator from "../components/cleaning/AIInvoiceGenerator";
import PaymentModal from "../components/cleaning/PaymentModal";

export default function CleaningJobs() {
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);

  const loadJobs = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [jobsData, clientsData, locationsData, servicesData] = await Promise.all([
        base44.entities.CleaningJob.filter(userFilter, "-scheduled_start_at"),
        base44.entities.CleaningClient.filter(userFilter),
        base44.entities.ClientLocation.filter(userFilter),
        base44.entities.ServiceType.filter(userFilter)
      ]);
      setJobs(jobsData || []);
      setClients(clientsData || []);
      setLocations(locationsData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
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
      loadJobs();
    }
  }, [currentUser, loadJobs]);

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-800',
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-amber-100 text-amber-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
            <p className="text-slate-600 mt-1">Manage all cleaning jobs and bookings</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              {jobs.map(job => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          {job.assigned_cleaners?.length > 0 && (
                            <span className="text-sm text-slate-600">
                              {job.assigned_cleaners.length} cleaner{job.assigned_cleaners.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(job.scheduled_start_at).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">Location ID: {job.client_location_id}</span>
                          </div>

                          {job.price_quote && (
                            <div className="text-sm text-slate-600">
                              Quote: ${job.price_quote}
                            </div>
                          )}
                        </div>

                        {job.notes_for_team && (
                          <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                            {job.notes_for_team}
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          {job.status === 'in_progress' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedJob(job);
                                setShowFeedbackModal(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Complete & Give Feedback
                            </Button>
                          )}
                          
                          {job.status === 'completed' && (
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedJob(job);
                                setShowInvoiceModal(true);
                              }}
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              Generate Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {jobs.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No jobs scheduled</h3>
                    <p className="text-slate-500 mb-6">Create your first cleaning job</p>
                    <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Job
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Calendar View</h3>
                <p className="text-slate-500">Calendar integration coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showCreateModal && (
          <JobCreateModal
            onClose={() => setShowCreateModal(false)}
            onRefresh={loadJobs}
          />
        )}

        {showFeedbackModal && selectedJob && (
          <CleaningFeedbackModal
            job={selectedJob}
            onClose={() => {
              setShowFeedbackModal(false);
              setSelectedJob(null);
            }}
            onRefresh={loadJobs}
          />
        )}

        {showInvoiceModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl">
              <AIInvoiceGenerator
                job={selectedJob}
                client={clients.find(c => c.id === selectedJob.client_id)}
                location={locations.find(l => l.id === selectedJob.client_location_id)}
                service={services.find(s => s.id === selectedJob.service_type_id)}
                onInvoiceCreated={(invoice) => {
                  setShowInvoiceModal(false);
                  setSelectedInvoice(invoice);
                  setShowPaymentModal(true);
                }}
              />
              <Button 
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedJob(null);
                }}
                variant="outline"
                className="w-full mt-4 bg-white"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {showPaymentModal && selectedInvoice && (
          <PaymentModal
            invoice={selectedInvoice}
            client={clients.find(c => c.id === selectedInvoice.client_id)}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedInvoice(null);
            }}
            onPaymentComplete={() => {
              setShowPaymentModal(false);
              setSelectedInvoice(null);
              setSelectedJob(null);
              loadJobs();
            }}
          />
        )}
      </div>
    </div>
  );
}