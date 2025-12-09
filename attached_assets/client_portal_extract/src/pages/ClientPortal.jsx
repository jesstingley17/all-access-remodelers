import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, FileText, CheckCircle, MessageSquare, Clock, AlertCircle } from "lucide-react";
import ProjectProgress from "../components/client-portal/ProjectProgress";
import DocumentViewer from "../components/client-portal/DocumentViewer";
import DeliverableApproval from "../components/client-portal/DeliverableApproval";
import ClientMessaging from "../components/client-portal/ClientMessaging";

export default function ClientPortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("projects");

  const loadPortalData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Find client record by email
      const clients = await base44.entities.Client.filter({ email: currentUser.email });
      const clientRecord = clients[0];
      
      if (!clientRecord) {
        setClient(null);
        setIsLoading(false);
        return;
      }
      
      setClient(clientRecord);

      // Load all client data
      const [projectsData, documentsData, deliverablesData, messagesData] = await Promise.all([
        base44.entities.Project.filter({ client_id: clientRecord.id }),
        base44.entities.ClientDocument.filter({ client_id: clientRecord.id }),
        base44.entities.Deliverable.list(),
        base44.entities.Message.filter({ client_id: clientRecord.id })
      ]);

      // Filter deliverables for client's projects
      const clientProjectIds = projectsData.map(p => p.id);
      const clientDeliverables = deliverablesData.filter(d => clientProjectIds.includes(d.project_id));

      setProjects(projectsData || []);
      setDocuments(documentsData || []);
      setDeliverables(clientDeliverables || []);
      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error loading portal data:", error);
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
      loadPortalData();
    }
  }, [currentUser, loadPortalData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading your portal...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Client Portal Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Please log in to access your client portal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Client Profile Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              We couldn't find a client profile associated with your account. 
              Please contact support for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingApprovals = deliverables.filter(d => d.status === 'pending_review').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const unreadMessages = messages.filter(m => m.status === 'unread' && m.message_type === 'incoming').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                {client.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Welcome, {client.name}</h1>
              <p className="text-slate-600 mt-1">{client.company || 'Client Portal'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{activeProjects}</div>
                  <div className="text-sm text-slate-600">Active Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{pendingApprovals}</div>
                  <div className="text-sm text-slate-600">Pending Approvals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
                  <div className="text-sm text-slate-600">Documents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{unreadMessages}</div>
                  <div className="text-sm text-slate-600">New Messages</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 border border-slate-200">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approvals
              {pendingApprovals > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingApprovals}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
              {unreadMessages > 0 && (
                <Badge variant="destructive" className="ml-1">{unreadMessages}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6">
            <ProjectProgress projects={projects} onRefresh={loadPortalData} />
          </TabsContent>

          <TabsContent value="approvals" className="mt-6">
            <DeliverableApproval 
              deliverables={deliverables} 
              projects={projects}
              onRefresh={loadPortalData}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentViewer documents={documents} projects={projects} />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <ClientMessaging 
              clientId={client.id}
              messages={messages}
              onRefresh={loadPortalData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}