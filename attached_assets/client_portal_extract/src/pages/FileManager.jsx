import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Client } from '@/api/entities';
import { Project } from '@/api/entities';
import { ClientDocument } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, Folder, File, Users, Home, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

import DocumentList from '../components/files/DocumentList';
import FileManagerHeader from '../components/files/FileManagerHeader';
import FileUploaderModal from '../components/files/FileUploaderModal';
import GenerateFromTemplateModal from '../components/files/GenerateFromTemplateModal';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function FileManager() {
  const query = useQuery();
  const clientId = query.get('client_id');
  const projectId = query.get('project_id');

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState('all');

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);

  const loadDocuments = useCallback(async (filterClientId = null, filterProjectId = null) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const allDocs = await ClientDocument.filter(userFilter, '-updated_date');
      const filteredDocs = (allDocs || []).filter(doc => {
        if (filterProjectId) return doc.project_id === filterProjectId;
        if (filterClientId) return doc.client_id === filterClientId;
        return true;
      });
      setDocuments(filteredDocs);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  const loadInitialData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [clientsData, projectsData] = await Promise.all([
        Client.filter(userFilter, '-updated_date'),
        Project.filter(userFilter, '-updated_date')
      ]);
      setClients(clientsData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setClients([]);
      setProjects([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Error fetching user:", e);
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser, loadInitialData]);

  const handleSelectionChange = useCallback(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      const client = clients.find(c => c.id === project?.client_id);
      setSelectedProject(project);
      setSelectedClient(client);
      setView('project');
      loadDocuments(null, projectId);
    } else if (clientId && clients.length > 0) {
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client);
      setSelectedProject(null);
      setView('client');
      loadDocuments(clientId, null);
    } else if (!clientId && !projectId) {
      setSelectedClient(null);
      setSelectedProject(null);
      setView('all');
      loadDocuments();
    }
  }, [clientId, projectId, clients, projects, loadDocuments]);

  useEffect(() => {
    if (clients.length > 0 && projects.length > 0) {
      handleSelectionChange();
    }
  }, [clients, projects, handleSelectionChange]);
  
  const handleDocumentChange = () => {
    handleSelectionChange();
  };

  const Breadcrumbs = () => (
    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
      <Link to="/files" className="flex items-center gap-1 hover:text-slate-900">
        <Home className="w-4 h-4" />
        <span>All Files</span>
      </Link>
      {selectedClient && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to={`/files?client_id=${selectedClient.id}`} className="flex items-center gap-1 hover:text-slate-900">
            <Users className="w-4 h-4" />
            <span>{selectedClient.company_name}</span>
          </Link>
        </>
      )}
      {selectedProject && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to={`/files?project_id=${selectedProject.id}`} className="flex items-center gap-1 hover:text-slate-900">
            <Folder className="w-4 h-4" />
            <span>{selectedProject.title}</span>
          </Link>
        </>
      )}
    </div>
  );

  if (isLoading && !clients.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-lg text-slate-700">Loading file manager...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to access file manager.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <FileManagerHeader 
          onUpload={() => setUploadModalOpen(true)} 
          onGenerate={() => setTemplateModalOpen(true)}
        />
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <div className="p-4 border-b border-slate-200/60">
            <Breadcrumbs />
          </div>
          <DocumentList
            documents={documents}
            clients={clients}
            projects={projects}
            isLoading={isLoading}
            onRefresh={handleDocumentChange}
          />
        </Card>

        {isUploadModalOpen && (
          <FileUploaderModal
            onClose={() => setUploadModalOpen(false)}
            onUploadSuccess={handleDocumentChange}
            clients={clients}
            projects={projects}
            initialClientId={clientId}
            initialProjectId={projectId}
          />
        )}
        
        {isTemplateModalOpen && (
            <GenerateFromTemplateModal
                onClose={() => setTemplateModalOpen(false)}
                onGenerationSuccess={handleDocumentChange}
                clients={clients}
                projects={projects}
                initialClientId={clientId}
                initialProjectId={projectId}
            />
        )}
      </div>
    </div>
  );
}