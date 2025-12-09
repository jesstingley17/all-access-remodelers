import React, { useState } from 'react';
import { ClientDocument } from '@/api/entities';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFile } from '@/api/integrations';
import { Plus, FileText, Download, Loader2 } from "lucide-react";
import { format } from 'date-fns';

export default function DocumentsSection({ clientId, documents, onRefresh }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ document_name: '', document_type: 'other', file: null });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDoc({ ...newDoc, file: file, document_name: newDoc.document_name || file.name });
    }
  };

  const handleUpload = async () => {
    if (!newDoc.file || !newDoc.document_name) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file: newDoc.file });
      
      await ClientDocument.create({
        client_id: clientId,
        document_name: newDoc.document_name,
        file_url: file_url,
        document_type: newDoc.document_type
      });
      
      setNewDoc({ document_name: '', document_type: 'other', file: null });
      setIsAdding(false);
      onRefresh();
    } catch (error) {
      console.error("Error uploading document:", error);
    }
    setIsUploading(false);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents ({documents.length})
        </h3>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
          <Input
            placeholder="Document name"
            value={newDoc.document_name}
            onChange={(e) => setNewDoc({ ...newDoc, document_name: e.target.value })}
          />
          
          <Select value={newDoc.document_type} onValueChange={(value) => setNewDoc({ ...newDoc, document_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          />

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpload} disabled={isUploading || !newDoc.file}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {documents.length > 0 ? (
          documents.map(doc => (
            <div key={doc.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{doc.document_name}</p>
                  <p className="text-xs text-slate-500">
                    {doc.document_type} • {format(new Date(doc.created_date), 'PPP')}
                  </p>
                </div>
              </div>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </a>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-8">No documents yet</p>
        )}
      </div>
    </Card>
  );
}