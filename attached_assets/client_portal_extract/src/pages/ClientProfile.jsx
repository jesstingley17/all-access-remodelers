import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Client } from "@/api/entities";
import { Project } from "@/api/entities";
import { ClientNote } from "@/api/entities";
import { ClientDocument } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, Mail, Phone, Globe, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { createPageUrl } from "@/utils";

import ClientOverviewCard from "../components/profile/ClientOverviewCard";
import ContactInformation from "../components/profile/ContactInformation";
import CommunicationPreferences from "../components/profile/CommunicationPreferences";
import NotesSection from "../components/profile/NotesSection";
import DocumentsSection from "../components/profile/DocumentsSection";
import RelationshipTimeline from "../components/profile/RelationshipTimeline";

export default function ClientProfile() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadClientData = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (!user) {
        setIsLoading(false);
        return;
      }

      const userFilter = { created_by: user.email };
      
      const [clientData, projectsData, notesData, docsData] = await Promise.all([
        Client.filter({ id: id }),
        Project.filter({ client_id: id, ...userFilter }),
        ClientNote.filter({ client_id: id, ...userFilter }),
        ClientDocument.filter({ client_id: id, ...userFilter })
      ]);

      setClient(clientData && clientData[0] ? clientData[0] : null);
      setProjects(projectsData || []);
      setNotes(notesData || []);
      setDocuments(docsData || []);

    } catch (error) {
      console.error("Error loading client profile:", error);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-200 rounded w-48"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to view client profiles.</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <Building className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Client Not Found</h2>
          <p className="text-slate-600 mb-6">This client doesn't exist or you don't have access to it.</p>
          <Link to={createPageUrl("ClientList")}>
            <Button>Back to Clients</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("ClientList")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{client.company_name}</h1>
            <p className="text-slate-600 mt-1 font-medium">Complete client profile and relationship management</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ClientOverviewCard client={client} projects={projects} />
            <ContactInformation client={client} />
            <CommunicationPreferences client={client} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="projects">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Projects ({projects.length})</h3>
                  {projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.map(project => (
                        <Link key={project.id} to={createPageUrl(`ProjectDetail/${project.id}`)}>
                          <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-slate-900">{project.title}</h4>
                                <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                              </div>
                              <span className="text-sm text-slate-500">{project.status}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No projects yet</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <NotesSection clientId={id} notes={notes} onRefresh={loadClientData} />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsSection clientId={id} documents={documents} onRefresh={loadClientData} />
              </TabsContent>

              <TabsContent value="timeline">
                <RelationshipTimeline client={client} projects={projects} notes={notes} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}