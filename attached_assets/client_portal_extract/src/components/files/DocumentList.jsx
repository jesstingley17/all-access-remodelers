import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Search, File, MoreHorizontal, Folder, Users, Download, Edit, Trash2, Archive, History, Sparkles } from 'lucide-react';
import { ClientDocument } from '@/api/entities';
import DocumentVersionHistory from './DocumentVersionHistory';
import DocumentSummarizer from './DocumentSummarizer';

const documentTypeColors = {
  contract: 'bg-red-100 text-red-800',
  proposal: 'bg-blue-100 text-blue-800',
  invoice: 'bg-green-100 text-green-800',
  deliverable: 'bg-purple-100 text-purple-800',
  resource: 'bg-yellow-100 text-yellow-800',
  correspondence: 'bg-indigo-100 text-indigo-800',
  other: 'bg-slate-100 text-slate-800',
};

const statusColors = {
  draft: 'bg-slate-200 text-slate-800',
  pending_review: 'bg-yellow-200 text-yellow-800',
  approved: 'bg-green-200 text-green-800',
  archived: 'bg-gray-200 text-gray-800',
};

export default function DocumentList({ documents, clients, projects, isLoading, onRefresh }) {
  const [showVersionHistory, setShowVersionHistory] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [showSummarizer, setShowSummarizer] = React.useState(false);
  const [summarizerDocument, setSummarizerDocument] = React.useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const typeMatch = typeFilter === 'all' || doc.document_type === typeFilter;
    const searchMatch = searchTerm === '' || 
      doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return typeMatch && searchMatch;
  });
  
  const getClientName = (clientId) => clients.find(c => c.id === clientId)?.company_name || 'N/A';
  const getProjectName = (projectId) => projects.find(p => p.id === projectId)?.title || 'N/A';

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        try {
            await ClientDocument.delete(docId);
            onRefresh();
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Failed to delete document.");
        }
    }
  };

  return (
    <div>
      <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-slate-200/60">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Search by name, tag, or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="deliverable">Deliverable</SelectItem>
            <SelectItem value="resource">Resource</SelectItem>
            <SelectItem value="correspondence">Correspondence</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Associated With</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="text-slate-900">{doc.document_name}</div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {doc.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${documentTypeColors[doc.document_type]}`}>{doc.document_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{getClientName(doc.client_id)}</span>
                      </div>
                      {doc.project_id && (
                        <div className="flex items-center gap-1">
                          <Folder className="w-3 h-3 text-slate-500" />
                          <span>{getProjectName(doc.project_id)}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[doc.status]} capitalize`}>{doc.status.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {format(new Date(doc.updated_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => window.open(doc.file_url, '_blank')}>
                          <Download className="w-4 h-4 mr-2" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                          setSummarizerDocument(doc);
                          setShowSummarizer(true);
                        }}>
                          <Sparkles className="w-4 h-4 mr-2" /> AI Summary
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                          setSelectedDocument(doc);
                          setShowVersionHistory(true);
                        }}>
                          <History className="w-4 h-4 mr-2" /> Version History
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onSelect={() => handleDelete(doc.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-48 text-slate-500">
                  <File className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  No documents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showVersionHistory && selectedDocument && (
        <DocumentVersionHistory
          document={selectedDocument}
          onClose={() => {
            setShowVersionHistory(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {showSummarizer && summarizerDocument && (
        <DocumentSummarizer
          document={summarizerDocument}
          onClose={() => {
            setShowSummarizer(false);
            setSummarizerDocument(null);
          }}
        />
      )}
    </div>
  );
}