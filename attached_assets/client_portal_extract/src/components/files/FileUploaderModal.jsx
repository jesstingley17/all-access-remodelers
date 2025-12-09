import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UploadFile } from '@/api/integrations';
import { ClientDocument } from '@/api/entities';
import { X, UploadCloud, Loader2 } from 'lucide-react';

export default function FileUploaderModal({ onClose, onUploadSuccess, clients, projects, initialClientId, initialProjectId }) {
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [tags, setTags] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDocumentName(selectedFile.name.split('.').slice(0, -1).join('.'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedClientId) {
      setError('A file and a client must be selected.');
      return;
    }
    
    setIsUploading(true);
    setError('');

    try {
      const { file_url } = await UploadFile({ file });
      
      const docData = {
        client_id: selectedClientId,
        project_id: selectedProjectId || null,
        document_name: documentName,
        document_type: documentType,
        file_url,
        description,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: 'draft',
      };

      await ClientDocument.create(docData);
      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setError('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const availableProjects = projects.filter(p => p.client_id === selectedClientId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>Add a new file to your manager. Select a client and optionally a project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="client">Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="project">Project (Optional)</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!selectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                {availableProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>File</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600">
                  <Label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <Input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required />
                  </Label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">{file ? file.name : 'PNG, JPG, PDF, etc.'}</p>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="documentName">Document Name</Label>
            <Input id="documentName" value={documentName} onChange={(e) => setDocumentName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
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
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}